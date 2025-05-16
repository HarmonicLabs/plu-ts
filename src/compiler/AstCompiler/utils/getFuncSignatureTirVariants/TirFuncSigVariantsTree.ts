import { TirFuncT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";

export type TirFuncSigVariantsTree
    = TirFuncSigVariantsTreeNode
    | TirFuncSigVariantsTreeLeaf

export function isTirFuncSigVariantsTree( node: any ): node is TirFuncSigVariantsTree
{
    return (
        node instanceof TirFuncSigVariantsTreeNode
        || node instanceof TirFuncSigVariantsTreeLeaf
    );
}

export class TirFuncSigVariantsTreeNode
{
    constructor(
        readonly type: TirType,
        readonly children: TirFuncSigVariantsTree[]
    ) {}

    public isLeaf(): this is TirFuncSigVariantsTreeLeaf
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

}

export class TirFuncSigVariantsTreeLeaf
{
    constructor(
        readonly type: TirType
    ) {}

    public isLeaf(): this is TirFuncSigVariantsTreeLeaf
    {
        return true;
    }

    toArrays(): TirType[][]
    {
        return [[ this.type ]];
    }
}