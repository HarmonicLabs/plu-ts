import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import type { UPLCTerm } from "../../UPLC/UPLCTerm";
import type { PType } from "../PType";

import { isCloneable } from "../../../types/interfaces/Cloneable";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Machine } from "../../CEK";
import { FromPType, ToPType } from "../type_system/ts-pluts-conversion";
import { isWellFormedGenericType, isWellFormedType } from "../type_system/kinds/isWellFormedType";
import { GenericTermType, TermType } from "../type_system/types";

export type UnTerm<T extends Term<PType>> = T extends Term<infer PT extends PType > ? PT : never;

export class Term<A extends PType>
{
    /**
     * in most cases it will never be used
     * 
     * it's solely purpose is to allow typescript to rise errors (at type level)
     * when the type arguments don't match
     */
    _pInstance?: A;
    get pInstance(): A | undefined
    {
        if( this._pInstance === undefined ) return undefined;
        return isCloneable( this._pInstance ) ? 
            this._pInstance.clone() : 
            this._pInstance;
    }

    // typescript being silly here
    _type!: FromPType<A> | TermType;
    get type(): FromPType<A> | TermType
    {
        return this._type
    };

    protected _toUPLC!: ( deBruijnLevel: bigint ) => UPLCTerm
    get toUPLC(): ( deBruijnLevel: bigint | number ) => UPLCTerm
    {
        return ( deBruijnLevel: bigint | number ) =>
        {
            if( typeof deBruijnLevel !== "bigint" ) deBruijnLevel = BigInt( deBruijnLevel );
            if( (this as any).isConstant )
                return Machine.evalSimple( this._toUPLC( deBruijnLevel ) )
            return this._toUPLC( deBruijnLevel );
        } 
    };

    constructor( type: FromPType<A> | FromPType<ToPType<TermType>> , toUPLC: ( dbn: bigint ) => UPLCTerm, isConstant: boolean = false )
    {
        JsRuntime.assert(
            isWellFormedGenericType( type ) || Boolean(void console.log( type )),
            "invalid type while constructing Term"
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
                        // const compiled = this._toUPLC( BigInt( 0 ) )
                        // true if the compiled term is instance of ```UPLCConst``` (any type)
                        // _isConstant = compiled instanceof UPLCConst ||
                        //     compiled instanceof ErrorUPLC || 
                        //     (compiled instanceof HoistedUPLC && compiled.UPLC instanceof UPLCConst)
                        _isConstant = true
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

export type ToTermArr<Ts extends TermType[]> =
    Ts extends [] ? [] & Term<PType>[] :
    Ts extends [infer T extends TermType] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;

export type ToTermArrNonEmpty<Ts extends [ TermType, ...TermType[] ]> =
    Ts extends [] ? never & Term<PType>[] :
    Ts extends [infer T extends TermType] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;
