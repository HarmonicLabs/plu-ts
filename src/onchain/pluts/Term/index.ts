import { isCloneable } from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import { StructCtorDef, StructDefinition } from "../PTypes/PStruct";
import { Alias, anyStruct, ConstantableTermType, FromPType, structType, TermType } from "./Type";
import { isAliasType, isStructType, isWellFormedType } from "./Type/kinds";

// avoid circular ref
function unwrapAlias<T extends ConstantableTermType>( aliasedType: Alias<symbol, T> ): T
{
    return aliasedType[1].type;
}

// avoid circular ref
function ctorDefToString( ctorDef: StructCtorDef ): string
{
    const fields = Object.keys( ctorDef );

    let str = "{";

    for( const fieldName of fields )
    {
        str += ' ' + fieldName + ": " + termTypeToString( ctorDef[ fieldName ] );
    }

    str += " }";

    return str;
}

// avoid circular ref
function structDefToString( def: StructDefinition ): string
{
    const ctors = Object.keys( def );

    let str = "{";

    for( const ctor of ctors )
    {
        str += ' ' + ctor + ": " + ctorDefToString( def[ctor] ) + " },"
    }

    str = str.slice( 0, str.length - 1 ) + " }";

    return  str
}

// avoid circular ref
function termTypeToString( t: TermType ): string
{
    if( isStructType( t ) )
    {
        return "struct(" + (
            t[1] === anyStruct ? "anyStruct" : structDefToString( t[1] as StructDefinition )
        ) + ")";
    }
    if( isAliasType( t ) )
    {
        return "alias(" + (
            termTypeToString( unwrapAlias( t ) )
        ) + ")";
    }
    if( typeof t[0] === "symbol" ) return "tyParam("+ t[0].description +")";
    const tyArgs = t.slice(1) as TermType[];
    return ( t[0] + (tyArgs.length > 0 ? ',': "") + tyArgs.map( termTypeToString ).toString() );
}

export type UnTerm<T extends Term<PType>> = T extends Term<infer PT extends PType > ? PT : never;

export default class Term<A extends PType>
{
    /**
     * in most cases it will never be used
     * 
     * it's solely purpose is to allow typescript to rise errors (at type level)
     * when the type arguments don't match
     */
    protected _pInstance?: A;
    get pInstance(): A | undefined
    {
        if( this._pInstance === undefined ) return undefined;
        return isCloneable( this._pInstance ) ? 
            this._pInstance.clone() : 
            this._pInstance;
    }

    protected _type!: FromPType<A>;
    get type(): FromPType<A> {
        return this._type
    };

    protected _toUPLC!: ( deBruijnLevel: bigint ) => UPLCTerm
    get toUPLC(): ( deBruijnLevel: bigint | number ) => UPLCTerm
    {
        return ( deBruijnLevel: bigint | number ) =>
        {
            if( typeof deBruijnLevel !== "bigint" ) deBruijnLevel = BigInt( deBruijnLevel );
            return this._toUPLC( deBruijnLevel );
        } 
    };

    constructor( type: FromPType<A> , toUPLC: ( dbn: bigint ) => UPLCTerm, isConstant: boolean = false )
    {
        JsRuntime.assert(
            isWellFormedType( type ),
            "invalid type while constructing Term: " + termTypeToString( type )
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "_type",
            type
        );

        const proofSym = Symbol("overwrite_toUPLC_proofSym");

        // "copying" the function ref is needed to prevent potential "external" js override
        // 'toUPLC' (the constructor param) is used to override in case of hoisting
        // '_toUPLC' is used to get and set the property
        let _toUPLC = toUPLC;
        Object.defineProperty(
            this,
            "_toUPLC",
            {
                get: () => _toUPLC,
                set: ( v: { proof: symbol, value: ( dbn: bigint ) => UPLCTerm }) => {
                    if( typeof v === "object" && v?.proof === proofSym )
                    {
                        _toUPLC = v.value;
                    }
                },
                configurable: false,
                enumerable: true
            }
        );

        ObjectUtils.defineReadOnlyHiddenProperty(
            this,
            "hoist",
            () => {
                this._toUPLC = {
                    proof: proofSym,
                    value: (_dbn : bigint) => {

                        const hoisted = toUPLC( BigInt( 0 ) );

                        // console.log( showUPLC( hoisted ) );
                        
                        // throws if the term is not closed
                        // for how terms are created it should never be the case
                        return new HoistedUPLC(
                            hoisted
                        );
                    }
                } as any;
            }
        )

        let _isConstant: boolean = false;
        Object.defineProperty(
            this,
            "isConstant",
            {
                get: () => _isConstant,
                set: ( isConst: boolean ) => {
                    if( typeof isConst !== "boolean" ) return;
                    if( isConst === true )
                    {
                        // true if the compiled term is instance of ```UPLCConst``` (any type)
                        _isConstant = Object.getPrototypeOf(
                            this._toUPLC( BigInt( 0 ) )
                        ) === UPLCConst.prototype
                    }
                    else
                    {
                        _isConstant = false;
                    }
                    return;
                },
                enumerable: false,
                configurable: false
            }
        );
        // calls the `set` function of the descriptor above;
        (this as any).isConstant = isConstant;
        
    }
    
}
