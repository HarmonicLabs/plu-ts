import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { UPLCTerm } from "../../UPLC/UPLCTerm";
import type { PType } from "../PType";

import { isCloneable } from "../../../types/interfaces/Cloneable";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Machine } from "../../CEK";
import { FromPType, ToPType } from "../type_system/ts-pluts-conversion";
import { isWellFormedGenericType } from "../type_system/kinds/isWellFormedType";
import { TermType } from "../type_system/types";
import { HoistedSourceUID } from "../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID";
import { genHoistedSourceUID } from "../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID";
import { cloneTermType } from "../type_system/cloneTermType";
import { ToUPLC } from "../../UPLC/interfaces/ToUPLC";
import { ToIR } from "../../IR/interfaces/ToIR";

export type UnTerm<T extends Term<PType>> = T extends Term<infer PT extends PType > ? PT : never;

export class Term<A extends PType>
    implements ToUPLC
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
    readonly type!: FromPType<A> | TermType;
    
    readonly toUPLC!: ( deBruijnLevel: bigint | number ) => UPLCTerm

    constructor( type: FromPType<A> | FromPType<ToPType<TermType>> , _toUPLC: ( dbn: bigint ) => UPLCTerm, isConstant: boolean = false )
    {
        JsRuntime.assert(
            isWellFormedGenericType( type ) ||
            Boolean(void console.log( type )),
            "invalid type while constructing Term"
        );

        let _type = cloneTermType( type );
        Object.defineProperty(
            this,
            "type",
            {
                get: () => cloneTermType( _type ),
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        let _toUPLC_ = _toUPLC;

        Object.defineProperty(
        this, "toUPLC",
        {
            value: ( deBruijnLevel: bigint | number ) =>
            {
                if( typeof deBruijnLevel !== "bigint" ) deBruijnLevel = BigInt( deBruijnLevel );
    
                let uplc = _toUPLC_( deBruijnLevel );
                if( 
                    !(uplc instanceof HoistedUPLC) &&
                    (this as any).isConstant
                )
                {
                    // console.log("evaluating:\n\n", showUPLC( uplc ) );
    
                    // !!! IMPORTANT !!!
                    // pair creation assumes this evaluation is happening here
                    // if for whatever reason this is removed please adapt the rest of the codebas
                    uplc = Machine.evalSimple( uplc )
                }
    
                return uplc;
            },
            writable: false,
            enumerable: true,
            configurable: false
        });

        let _this_hoistedUID: HoistedSourceUID | undefined = undefined;
        const getThisHoistedUID = () => {
            if( typeof _this_hoistedUID !== "string" )
            {
                _this_hoistedUID = genHoistedSourceUID();
            }
            return _this_hoistedUID;
        }

        let wasEverHoisted: boolean = false;
        ObjectUtils.defineReadOnlyHiddenProperty(
            this,
            "hoist",
            () => {
                if( wasEverHoisted ) return;
                else wasEverHoisted = true;
                
                const prev_toUPLC_ = _toUPLC_;
                
                _toUPLC_ = ( dbn: bigint ) =>
                    new HoistedUPLC(
                        prev_toUPLC_( dbn ), 
                        getThisHoistedUID()
                    );
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
                    
                    _isConstant = isConst;
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
