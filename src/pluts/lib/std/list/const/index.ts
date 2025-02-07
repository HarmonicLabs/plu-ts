import { Machine } from "@harmoniclabs/plutus-machine";
import { IRConst } from "../../../../../IR/IRNodes/IRConst";
import { assert } from "../../../../../utils/assert";
import { PList, PData } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { ToPType, isWellFormedType } from "../../../../../type_system";
import { typeExtends } from "../../../../../type_system/typeExtends";
import { PrimType, TermType, data, list, pair, tyVar } from "../../../../../type_system/types";
import { pnilData, pnilPairData } from "../../../builtins/data";
import { pprepend } from "../../../builtins/pprepend";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { _papp } from "../../data/conversion/minimal_common";
import { Data, isData } from "@harmoniclabs/plutus-data";
import { UPLCTerm, showUPLC } from "@harmoniclabs/uplc";
import { CEKConst } from "@harmoniclabs/plutus-machine";
import { TermList, addPListMethods } from "../../UtilityTerms/TermList";


export function assertValidAstListType( elemsT: TermType ): void
{
    assert(
        isWellFormedType( elemsT ) &&
        !(
            ( elemsT[0] === PrimType.Lambda ) ||
            ( elemsT[0] === PrimType.Delayed )
        ),
        "plutus only supports lists of types that can be converted to constants"
    );
}

export function pnil<ElemsT extends TermType>( elemsT: ElemsT ): TermList<ToPType<ElemsT>>
{
    assertValidAstListType( elemsT );

    if(
        typeExtends( elemsT, pair( tyVar(), tyVar() ) )
    )
    {
        return punsafeConvertType( pnilPairData, list( elemsT ) );
    }

    if( typeExtends( elemsT, data ) )
    {
        return punsafeConvertType( pnilData, list( elemsT ) );
    }

    return addPListMethods(
        new Term<PList<ToPType<ElemsT>>>(
            list( elemsT ),
            _dbn => IRConst.listOf( elemsT )([]),
            true
        )
    );
}

export function pconstList<ElemsT extends TermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => TermList<ToPType<ElemsT>>
{
    assertValidAstListType( elemsT );

    return ( elems: Term<ToPType<ElemsT>>[] ): TermList<ToPType<ElemsT>> => {
        assert(
            Array.isArray( elems ) && elems.every(
                el => 
                    el instanceof Term &&
                    (el as any).isConstant &&
                    typeExtends( el.type, elemsT )
            ),
            "invalid array of elements to construct a list with"
        );

        if( elems.length === 0 ) return pnil( elemsT );

        return addPListMethods(
            new Term<PList<ToPType<ElemsT>>>(
                list( elemsT ),
                (cfg, dbn) => {
                    return IRConst.listOf( elemsT )
                    ( 
                        elems.map(
                            el => {
                                let res: UPLCTerm = (Machine.evalSimple(
                                    el.toUPLC(dbn)
                                ));

                                if(!(res instanceof CEKConst))
                                {
                                    console.log("------------------- pconstList -------------------");
                                    console.log( res )
                                    console.log( showUPLC( el.toUPLC( dbn ) ) )
                                    throw res;
                                }

                                return res.value as Data
                            }
                        )
                    )
                },
                true
            )
        );
    }
}

export function pList<ElemsT extends TermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => TermList<ToPType<ElemsT>>
{
    return ( elems: Term<ToPType<ElemsT>>[] ): TermList<ToPType<ElemsT>> => {

        assert(
            Array.isArray( elems ) && elems.every(
                el => 
                    el instanceof Term &&
                    typeExtends( el.type, elemsT )
            ),
            "invalid array of elements to construct a list with"
        );

        let nConstantFromEnd = 0;

        for(let i = elems.length - 1; i >= 0; i--)
        {
            if( (elems[i] as any).isConstant ) nConstantFromEnd++;
            else break;
        }

        /**
         * if nConstantFromEnd === 0 
         * 
         * ```ts
         * elems.slice( elems.length - nConstantFromEnd )
         * ```
         * 
         * evalueates to ```[]```
         * 
         * which makes calling 
         * 
         * ```ts
         * pconstList( elemsT )([])
         * ```
         * 
         * equivalent to
         * 
         * ```ts
         * pnil( elemsT )
         * ```
         */
        let plist = pconstList( elemsT )( elems.slice( elems.length - nConstantFromEnd ) );

        // all the elements where constants
        if( nConstantFromEnd === elems.length ) return plist;

        for( let i = elems.length - nConstantFromEnd - 1; i >= 0; i-- )
        {
            plist =
                _papp(
                    _papp(
                        pprepend( elemsT ),
                        elems[i]
                    ),
                    plist
                ) as any
        }

        return addPListMethods( plist );
    }
}

export function pDataList( datas: Data[] ): Term<PList<PData>>
{
    assert(
        Array.isArray( datas ) && datas.every( isData ),
        "invalid list of data passed to 'pDataList'"
    );

    return new Term(
        list( data ),
        _dbn => IRConst.listOf( data )( datas ),
        true
    );
}