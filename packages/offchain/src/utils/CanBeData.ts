import { ByteString } from "@harmoniclabs/bytestring";
import { CborObj, CborString, isCborObj } from "@harmoniclabs/cbor";
import { hasOwn } from "@harmoniclabs/obj-utils";
import { Data, isData, dataFromCbor, dataFromCborObj } from "@harmoniclabs/plutus-data";
import { Machine } from "@harmoniclabs/plutus-machine";
import { ToUPLC, UPLCConst } from "@harmoniclabs/uplc";

export type CanBeData = Data | ToUPLC | CborObj | CborString | string;

export function cloneCanBeData( stuff: CanBeData ): CanBeData
{
    if( typeof stuff === "string" ) return stuff;

    if(
        stuff instanceof CborString || 
        isCborObj( stuff ) || 
        isData( stuff ) 
    ) return stuff.clone() as any;

    const result = Machine.evalSimple( stuff.toUPLC() );
    if(!( result instanceof UPLCConst ))
    {
        throw new Error(
            "`CanBeData` object that implements `ToUPLC` did not evaluated to a constant"
        );
    }
    const value = result.value;
    if( !isData( value ) )
    {
        throw new Error(
            "`CanBeData` object that implements `ToUPLC` evaluated to a constant with a non-Data value"
        );
    }
    return value;
}

export function canBeData( something: any ): something is CanBeData
{
    if(
        typeof something === "string" &&
        ByteString.isValidHexValue( something )
    ) return true;
    if( typeof something !== "object" ) return false;
    return (
        isData( something ) || 
        (
            typeof something === "object" &&
            hasOwn( something, "toUPLC" ) &&
            typeof something.toUPLC === "function"
        ) ||
        something instanceof CborString ||
        isCborObj( something )
    );
}

export function forceData( data: CanBeData ): Data
{
    if( typeof data === "string" )
    data = dataFromCbor( data );
    
    if( isData( data ) )
    {
        return data;
    }

    if(
        typeof data === "object" &&
        hasOwn( data, "toUPLC" ) &&
        typeof data.toUPLC === "function"
    )
    {
        const uplcData = Machine.evalSimple( data.toUPLC() );
        if( !( uplcData instanceof UPLCConst ) )
        {
            throw new Error(
                "term passed as 'datum' field evaluated to an error"
            );
        }

        const _data = uplcData.value;

        if( !isData( _data ) )
        {
            throw new Error(
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

    throw new Error(
        "'forceData' did not match any possible 'CanBeData' value"
    );
}