import { assertValidListType } from ".";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { PList } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { TermType, ToPType, typeExtends, pair, data, list } from "../../../../type_system";
import { termTyToConstTy } from "../../../../type_system/termTyToConstTy";
import { pnilPairData, pnilData } from "../../../builtins";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";


export function _pnil<ElemsT extends TermType>( elemsT: ElemsT ): Term<PList<ToPType<ElemsT>>>
{
    assertValidListType( elemsT );

    if(
        typeExtends( elemsT, pair( data, data ) )
    )
    {
        return _punsafeConvertType( pnilPairData, list( elemsT ) );
    }

    if( typeExtends( elemsT, data ) )
    {
        return _punsafeConvertType( pnilData, list( elemsT ) );
    }

    return new Term<PList<ToPType<ElemsT>>>(
            list( elemsT ),
            _dbn => UPLCConst.listOf( termTyToConstTy( elemsT ) )([]),
            true
        )
}
