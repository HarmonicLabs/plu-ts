import JsRuntime from "../../../utils/JsRuntime";

import { CborObj, isCborObj } from "../../../cbor/CborObj";
import { CborString } from "../../../cbor/CborString";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Data, isData } from "../Data";
import { Machine } from "../../../onchain/CEK/Machine";
import { UPLCConst } from "../../../onchain/UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../onchain/pluts/Term";
import { dataFromCbor, dataFromCborObj } from "../fromCbor";
import { PData, PStruct, typeExtends, struct, data } from "../../../onchain";

export type CanBeData = Data | Term<PData> | Term<PStruct<any>> | CborObj | CborString

export function canBeData( something: any ): something is CanBeData
{
    if( typeof something !== "object" ) return false;
    return (
        isData( something ) || 
        (
            something instanceof Term &&
            typeExtends( something.type, data )
        ) ||
        something instanceof CborString ||
        isCborObj( something )
    );
}

const data_t = data;

export function forceData( data: CanBeData ): Data
{
    if( isData( data ) )
    {
        return data;
    }

    if( data instanceof Term )
    {
        if( !typeExtends( data.type, data_t ) )
        {
            throw new BasePlutsError(
                "datum was a term of a type that doesn't extends 'data'"
            );
        }
        const uplcData = Machine.evalSimple( data );
        if( !( uplcData instanceof UPLCConst ) )
        {
            throw new BasePlutsError(
                "term passed as 'datum' field evaluated to an error"
            );
        }

        const _data = uplcData.value;

        if( !isData( _data ) )
        {
            throw new BasePlutsError(
                "term of type 'data' evaluation resulted in a value that is not data"
            );
        }

        return _data;
    }

    if( data instanceof CborString )
    {
        return dataFromCbor( data )
    }
    if( isCborObj( data ) )
    {
        return dataFromCborObj( data )
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "'forceData' did not match any possible 'CanBeData' value"
    );
}