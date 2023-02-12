import { Data, isData } from "../../../../../types/Data/Data";
import JsRuntime from "../../../../../utils/JsRuntime";
import { Machine } from "../../../../CEK";
import { showUPLC } from "../../../../UPLC/UPLCTerm";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { PList, PData } from "../../../PTypes";
import { Term } from "../../../Term";
import { ConstantableTermType, typeExtends, Type, list, PrimType, pair, data } from "../../../Term/Type"
import { termTyToConstTy } from "../../../Term/Type/constTypeConversion";
import { isConstantableTermType } from "../../../Term/Type/kinds";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pnilPairData, pnilData, pprepend } from "../../builtins";
import { punsafeConvertType } from "../../punsafeConvertType";
import { TermList, addPListMethods } from "../UtilityTerms";


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

    if( typeExtends( elemsT, Type.Data.Any ) )
    {
        if( typeExtends( elemsT, Type.Data.Pair( Type.Data.Any, Type.Data.Any ) ) )
            return punsafeConvertType( pnilPairData, list( elemsT ) ) as any;
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
                dbn => UPLCConst.listOf( termTyToConstTy( elemsT ) )
                    ( 
                        elems.map(
                            el => {
                                const res = (Machine.evalSimple(
                                    el.toUPLC(dbn)
                                ) as any);

                                if(!(res instanceof UPLCConst))
                                {
                                    console.error("------------------- pconstList -------------------");
                                    console.error( res )
                                    console.error( showUPLC( el.toUPLC( dbn ) ) )
                                }
                                
                                return res.value as Data
                            }
                        ) as any
                    ),
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