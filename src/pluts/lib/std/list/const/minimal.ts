import { assertValidAstListType } from ".";
import { IRConst } from "../../../../../IR/IRNodes/IRConst";
import { PList } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { TermType, ToPType, typeExtends, pair, data, list } from "../../../../../type_system";
import { pnilPairData, pnilData } from "../../../builtins/data";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";


export function _pnil<ElemsT extends TermType>( elemsT: ElemsT ): Term<PList<ToPType<ElemsT>>>
{
    assertValidAstListType( elemsT );

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
            _dbn => IRConst.listOf( elemsT )([]),
            true
        )
}
