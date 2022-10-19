import PData from ".";
import BasePlutsError from "../../../../errors/BasePlutsError";
import Data from "../../../../types/Data";
import DataConstr from "../../../../types/Data/DataConstr";
import DataList from "../../../../types/Data/DataList";
import JsRuntime from "../../../../utils/JsRuntime";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { pListToData, punListData } from "../../Prelude/Builtins";
import Term from "../../Term";
import Type, { ToPDataType, ToPType } from "../../Term/Type";
import { dataTypeExtends } from "../../Term/Type/extension";
import PList from "../PList";
import { DataFromPData, DataToPData, inferDataValueType } from "./conversion";

export default class PDataList<PDataInstance extends PData> extends PData // (PData extends PType => PDataList extends PType too)
{
    constructor( datas: DataFromPData<PDataInstance>[] = [] )
    {
        super( new DataList( datas ) );
    }
}

export function pDataList<DataElemT extends Data>( datas: DataElemT[] )
    //@ts-ignore Type instantiation is excessively deep and possibly infinite.
    : Term<PDataList<DataToPData<DataElemT>>>
{
    if( datas.length === 0 ) return new Term(
        Type.Data.List( Type.Data.Any ),
        _dbn => UPLCConst.data( new DataList( datas ) )
    );

    let dataElemT = inferDataValueType( datas[0] );

    for( const dataElem of datas )
    {
        const thisDataElemT = inferDataValueType( dataElem );

        if(!dataTypeExtends( thisDataElemT, dataElemT ))
        {
            if( dataTypeExtends( dataElemT, thisDataElemT ) )
            {
                dataElemT = thisDataElemT;
            }
            else
            {
                /**
                 * @fixme add proper error
                 */
                throw new BasePlutsError(
                    "incongruent types of Datas while constructing a (constant) 'Term<PDataList>' instance"
                );
            }
        }

    }

    return new Term(
        Type.Data.List( dataElemT ),
        _dbn => UPLCConst.data( new DataList( datas ) )
    );
}