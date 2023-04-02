import JsRuntime from "../../../utils/JsRuntime";

import { CborObj, isCborObj } from "../../../cbor/CborObj";
import { CborString } from "../../../cbor/CborString";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Data, isData } from "../Data";
import { Machine } from "../../../onchain/CEK/Machine";
import { UPLCConst } from "../../../onchain/UPLC/UPLCTerms/UPLCConst";
import { dataFromCbor, dataFromCborObj } from "../fromCbor";
import { data } from "../../../onchain/pluts/type_system/types";
import { ToUPLC } from "../../../onchain/UPLC/interfaces/ToUPLC";
import ObjectUtils from "../../../utils/ObjectUtils";

export type CanBeData = Data | ToUPLC | CborObj | CborString

export function cloneCanBeData( stuff: CanBeData ): CanBeData
{
    if(
        stuff instanceof CborString || 
        isCborObj( stuff ) || 
        isData( stuff ) 
    ) return stuff.clone() as any;

    const result = Machine.evalSimple( stuff.toUPLC() );
    if(!( result instanceof UPLCConst ))
    {
        throw new BasePlutsError(
            "`CanBeData` object that implements `ToUPLC` did not evaluated to a constant"
        );
    }
    const value = result.value;
    if( !isData( value ) )
    {
        throw new BasePlutsError(
            "`CanBeData` object that implements `ToUPLC` evaluated to a constant with a non-Data value"
        );
    }
    return value;
}

export function canBeData( something: any ): something is CanBeData
{
    if( typeof something !== "object" ) return false;
    return (
        isData( something ) || 
        (
            typeof data === "object" &&
            ObjectUtils.hasOwn( data, "toUPLC" ) &&
            typeof data.toUPLC === "function"
        ) ||
        something instanceof CborString ||
        isCborObj( something )
    );
}

export function forceData( data: CanBeData ): Data
{
    if( isData( data ) )
    {
        return data;
    }

    if(
        typeof data === "object" &&
        ObjectUtils.hasOwn( data, "toUPLC" ) &&
        typeof data.toUPLC === "function"
    )
    {
        const uplcData = Machine.evalSimple( data.toUPLC() );
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