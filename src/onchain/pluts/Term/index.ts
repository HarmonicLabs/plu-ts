import { isCloneable } from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import { FromPType, Type } from "./Type";
import { isWellFormedType, termTypeToString } from "./Type/utils";


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
    get type(): FromPType<A> { return this._type };

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

        let _toUPLC = toUPLC;
        Object.defineProperty(
            this,
            "_toUPLC",
            {
                get: () => _toUPLC,
                set: ( v: { proof: symbol, value: ( dbn: bigint ) => UPLCTerm }) => {
                    if( v.proof === proofSym )
                    {
                        _toUPLC = v.value;
                    }
                },
                configurable: false,
                enumerable: true
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

        ObjectUtils.defineReadOnlyHiddenProperty(
            this,
            "hoist",
            () => {
                this._toUPLC = (_dbn : bigint) => 
                    // throws if the term is not closed
                    // for how terms are created it should never be the case
                    new HoistedUPLC(
                        this._toUPLC( BigInt( 0 ) )
                    )
            }
        )
    }
}
