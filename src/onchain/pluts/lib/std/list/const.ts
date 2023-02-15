import { Data, isData } from "../../../../../types/Data/Data";
import JsRuntime from "../../../../../utils/JsRuntime";
import { Machine } from "../../../../CEK";
import { UPLCTerm, showUPLC } from "../../../../UPLC/UPLCTerm";
import { ErrorUPLC } from "../../../../UPLC/UPLCTerms/ErrorUPLC";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { constT, constTypeEq } from "../../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { PList, PData } from "../../../PTypes";
import { Term } from "../../../Term";
import { termTyToConstTy } from "../../../Term/Type/constTypeConversion";
import { termTypeToString } from "../../../type_system/utils";
import { pnilPairData, pnilData, pprepend, ppairData, pfstPair, psndPair } from "../../builtins";
import { punsafeConvertType } from "../../punsafeConvertType";
import { TermList, addPListMethods } from "../UtilityTerms";
import { getToDataForType } from "../data/conversion/getToDataTermForType";


function assertValidListType( elemsT: ConstantableTermType ): void
{
    JsRuntime.assert(
        isConstantableTermType( elemsT ),
        "plutus only supports lists of types that can be converted to constants"
    );
}

export function pnil<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): TermList<ToPType<ElemsT>>
{
    assertValidListType( elemsT );

    if(
        elemsT[0] === PrimType.PairAsData ||
        typeExtends( elemsT, pair( data, data ) )
    )
    {
        return punsafeConvertType( pnilPairData, list( elemsT ) ) as any;
    }

    if( typeExtends( elemsT, data ) )
    {
        return punsafeConvertType( pnilData, list( elemsT ) ) as any;
    }

    return addPListMethods(
        new Term<PList<ToPType<ElemsT>>>(
            Type.List( elemsT ),
            _dbn => UPLCConst.listOf( termTyToConstTy( elemsT ) )([]),
            true
        )
    );
}

export function pconstList<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => TermList<ToPType<ElemsT>>
{
    assertValidListType( elemsT );

    return ( elems: Term<ToPType<ElemsT>>[] ): TermList<ToPType<ElemsT>> => {
        JsRuntime.assert(
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
                Type.List( elemsT ),
                dbn => {

                    const expectedConstTy = termTyToConstTy( elemsT );
                    console.log( elemsT, expectedConstTy )

                    return UPLCConst.listOf( expectedConstTy )
                    ( 
                        elems.map(
                            el => {
                                let res: UPLCTerm = (Machine.evalSimple(
                                    el.toUPLC(dbn)
                                ) as any);

                                console.log( res );

                                if( 
                                    (
                                        res instanceof ErrorUPLC &&
                                        el.type[0] === PrimType.PairAsData
                                    ) || (
                                        res instanceof UPLCConst &&
                                        !constTypeEq( res.type, expectedConstTy )
                                    )
                                )
                                {
                                    const [ _, fstT, sndT ] = el.type as any as ConstantableTermType[];
                                    el = ppairData( data, data )
                                        .$(
                                            getToDataForType( fstT )(
                                                pfstPair( fstT, sndT ).$( el as any )
                                            )
                                        )
                                        .$(
                                            getToDataForType( sndT )(
                                                psndPair( fstT, sndT ).$( el as any )
                                            )
                                        ) as any
                                    res = (Machine.evalSimple(
                                        el.toUPLC(dbn)
                                    ) as any);
                                }

                                console.log( res );
                                
                                if(!(res instanceof UPLCConst))
                                {
                                    console.log("------------------- pconstList -------------------");
                                    console.log( res )
                                    console.log( showUPLC( el.toUPLC( dbn ) ) )
                                    throw res
                                }

                                return res.value as Data
                            }
                        ) as any
                    )
                },
                true
            )
        );
    }
}

export function pList<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => TermList<ToPType<ElemsT>>
{
    return ( elems: Term<ToPType<ElemsT>>[] ): TermList<ToPType<ElemsT>> => {
        JsRuntime.assert(
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
                // @ ts-ignoreType instantiation is excessively deep and possibly infinite
                pprepend( elemsT )
                .$( elems[i] ).$( plist );
        }

        return plist;
    }
}

export function pDataList( datas: Data[] ): Term<PList<PData>>
{
    JsRuntime.assert(
        Array.isArray( datas ) && datas.every( isData ),
        "invalid list of data passed to 'pDataList'"
    );

    return new Term(
        Type.List( Type.Data.Any ),
        _dbn => UPLCConst.listOf( constT.data )( datas ),
        true
    );
}