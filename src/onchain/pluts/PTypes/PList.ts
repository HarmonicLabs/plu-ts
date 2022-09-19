import Data, { isData } from "../../../types/Data";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { pListToData, pnilData, pnilPairData, pprepend, punListData } from "../Prelude/Builtins";
import PType, { PDataRepresentable } from "../PType";
import Term from "../Term";
import Type, { ToPType, TermType, ConstantableTermType } from "../Term/Type";
import { isConstantableTermType, termTypeToString, termTyToConstTy, typeExtends } from "../Term/Type/utils";
import PData from "./PData";
import PDataList from "./PData/PDataList";


export default class PList<A extends PType> extends PDataRepresentable
{
    private _elems: A[];

    constructor( elements: A[] = [] )
    {
        super();

        this._elems = elements
    }

    static override get termType(): TermType { return Type.List( Type.Any )}
    static override get fromData(): (data: Term<PData>) => Term<PList<PData>>
    {
        return (data: Term<PData>) => punListData( Type.Data.Any ).$( data );
    }
    static override toData(term: Term<PList<PData>>): Term<PDataList<PData>>
    {
        return pListToData( Type.Data.Any ).$( term )
    }
}

function assertValidListType( elemsT: ConstantableTermType ): void
{
    JsRuntime.assert(
        isConstantableTermType( elemsT ),
        "plutus only supports lists of types that can be converted to constants"
    );
}

export function pnil<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): Term<PList<ToPType<ElemsT>>>
{
    assertValidListType( elemsT );

    if( typeExtends( elemsT, Type.Data.Any ) )
    {
        if( typeExtends( elemsT, Type.Data.Pair( Type.Data.Any, Type.Data.Any ) ) ) return pnilPairData as any;
        return pnilData as any;
    }

    return new Term<PList<ToPType<ElemsT>>>(
        Type.List( elemsT ),
        _dbn => UPLCConst.listOf( termTyToConstTy( elemsT ) )([]),
        true
    );
}

export function pconstList<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => Term<PList<ToPType<ElemsT>>>
{
    assertValidListType( elemsT );

    return ( elems: Term<ToPType<ElemsT>>[] ) => {
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

        return new Term<PList<ToPType<ElemsT>>>(
            Type.List( elemsT ),
            dbn => UPLCConst.listOf( termTyToConstTy( elemsT ) )
                ( 
                    elems.map(
                        el => ( el.toUPLC( dbn ) as UPLCConst ).value
                    )
                ),
            true
        );
    }
}

export function pList<ElemsT extends ConstantableTermType>( elemsT: ElemsT ): ( elems: Term<ToPType<ElemsT>>[] ) => Term<PList<ToPType<ElemsT>>>
{
    return ( elems: Term<ToPType<ElemsT>>[] ) => {
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
            plist = pprepend( elemsT ).$( elems[i] ).$( plist );
        }

        console.log( plist.toUPLC( 0 ) );
        return plist;
    }
}

export function pDataList( datas: Data[] ): Term<PList<PData>>
{
    console.log( datas );
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