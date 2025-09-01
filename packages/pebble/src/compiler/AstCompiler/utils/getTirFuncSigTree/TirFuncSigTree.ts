import { TirAliasType } from "../../../tir/types/TirAliasType";
import { TirFuncT } from "../../../tir/types/TirNativeType/native/function";
import { TirDataOptT } from "../../../tir/types/TirNativeType/native/Optional/data";
import { TirVoidT } from "../../../tir/types/TirNativeType/native/void";
import { TirDataStructType } from "../../../tir/types/TirStructType";
import { TirType } from "../../../tir/types/TirType";
import { TirTypeParam } from "../../../tir/types/TirTypeParam";

/** each branch is an overload */
export type TirFuncSigTreeElem
    = TirFuncSigTreeNode
    | TirFuncSigTreeLeaf
    ;

/** each branch is an overload */
export type TirFuncSigTree
    = TirFuncSigTreeRoot
    | TirFuncSigTreeElem
    ;

export function isTirFuncSigTree( node: any ): node is TirFuncSigTree
{
    return (
        node instanceof TirFuncSigTreeRoot
        || node instanceof TirFuncSigTreeNode
        || node instanceof TirFuncSigTreeLeaf
    );
}

export class TirFuncSigTreeRoot
{
    constructor(
        readonly children: TirFuncSigTreeElem[]
    ) {}

    public isLeaf(): this is TirFuncSigTreeLeaf
    {
        return false;
    }

    toArrays(): TirType[][]
    {
        const result = this.children
        .reduce(
            (accum, child) => accum.concat( child.toArrays() ),
            [] as TirType[][]
        );

        this.forgetChachedArrays(); // free some memory

        return result;
    }

    forgetChachedArrays(): void
    {
        for( const child of this.children ) {
            if( child instanceof TirFuncSigTreeNode ) {
                child.forgetChachedArrays();
            }
        }
    }

    sigs(): TirFuncT[]
    {
        return this
        .toArrays()
        .map( variant => {
            const paramTypes = variant.slice( 0, variant.length - 1 );
            const returnType = variant[ variant.length - 1 ];
    
            return new TirFuncT(
                paramTypes,
                returnType
            );
        })
    }

    sopSig(): TirFuncT
    {
        const sopTypes = this.sopTypes();
        if( sopTypes.length === 0 )
            return new TirFuncT( [], new TirVoidT() );

        return new TirFuncT(
            sopTypes.slice( 0, sopTypes.length - 1 ),
            sopTypes[ sopTypes.length - 1 ]
        );
    }

    sopTypes(): TirType[]
    {
        return this.children
        .find( child => child.isSopNode() )?.sopTypes()
        ?? this.children[0].sopTypes();
    }
}

export class TirFuncSigTreeNode
{
    constructor(
        readonly type: TirType,
        readonly children: TirFuncSigTreeElem[]
    ) {}

    public isLeaf(): this is TirFuncSigTreeLeaf
    {
        return false;
    }

    private _arrays: TirType[][] | undefined = undefined;
    toArrays(): TirType[][]
    {
        if( Array.isArray( this._arrays ) ) return this._arrays;

        const result: TirType[][] = this.children
        .reduce(
            ( accum, child ) => accum.concat( child.toArrays().map( arr => arr.slice() ) ),
            [] as TirType[][]
        );

        for( let i = 0; i < result.length; i++ )
        {
            result[i].unshift( this.type );
        }

        this._arrays = result;
        return result;
    }

    forgetChachedArrays(): void
    {
        if( Array.isArray( this._arrays ) ) this._arrays.length = 0
        this._arrays = undefined;
        for( const child of this.children ) {
            child.forgetChachedArrays();
        }
    }

    sopTypes(): TirType[]
    {
        return this.children
        .find( child => child.isSopNode() )?.sopTypes()
        ?? this.children[0].sopTypes();
    }

    private _isSop: boolean | undefined = undefined;
    isSopNode(): boolean
    {
        if( typeof this._isSop === "boolean" ) return this._isSop;

        let type = this.type;
        while( type instanceof TirAliasType ) type = type.aliased;
        
        this._isSop = !(
            type instanceof TirDataOptT
            || type instanceof TirDataStructType
            || type instanceof TirTypeParam
        );

        return this._isSop;
    }
}

export class TirFuncSigTreeLeaf
{
    constructor(
        readonly type: TirType
    ) {}

    public isLeaf(): this is TirFuncSigTreeLeaf
    {
        return true;
    }

    toArrays(): TirType[][]
    {
        return [[ this.type ]];
    }

    forgetChachedArrays(): void { /* no chached array in leaf */}

    sopTypes(): TirType[]
    {
        return [ this.type ];
    }

    private _isSop: boolean | undefined = undefined;
    isSopNode(): boolean
    {
        if( typeof this._isSop === "boolean" ) return this._isSop;

        let type = this.type;
        while( type instanceof TirAliasType ) type = type.aliased;
        
        this._isSop = !(
            type instanceof TirDataOptT
            || type instanceof TirDataStructType
            || type instanceof TirTypeParam
        );

        return this._isSop;
    }
}