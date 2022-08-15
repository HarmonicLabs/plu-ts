import Data, { DataConstr, isData } from ".";
import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborString from "../../cbor/CborString";
import JsRuntime from "../../utils/JsRuntime";


export function dataToCborObj( data: Data ): CborObj 
{
    JsRuntime.assert(
        isData( data ),
        "Invalid data to convert to CBOR"
    );

    if( data instanceof DataConstr )
    {
        
    }
}

export default function dataToCbor( data: Data ): CborString
{
    return Cbor.encode( dataToCborObj( data ) );
}