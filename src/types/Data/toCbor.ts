import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborString from "../../cbor/CborString";
import JsRuntime from "../../utils/JsRuntime";

import Data, { isData } from ".";
import DataConstr, { constrNumberToCborTag } from "./DataConstr";
import CborTag from "../../cbor/CborObj/CborTag";
import CborArray from "../../cbor/CborObj/CborArray";
import DataMap from "./DataMap";
import CborMap from "../../cbor/CborObj/CborMap";
import DataList from "./DataList";
import DataI from "./DataI";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborNegInt from "../../cbor/CborObj/CborNegInt";
import CborBytes from "../../cbor/CborObj/CborBytes";
import DataB from "./DataB";
import BasePlutsError from "../../errors/BasePlutsError";


export function dataToCborObj( data: Data ): CborObj 
{
    JsRuntime.assert(
        isData( data ),
        "Invalid data; cannot convert to CBOR"
    );

    if( data instanceof DataConstr )
    {
        const constrNum = data.constr.asBigInt;

        const tag = constrNumberToCborTag( constrNum );

        let fields = new CborArray(
            data.fields.map( dataToCborObj )
        );

        if( Number( tag ) === 102 )
        {
            /*
            Any alternatives, including those that don't fit in the above
            
            -> tag 102 followed by a list containing
                an unsigned integer for the actual alternative, 
                and then the arguments in a (nested!) list.
            */
            fields = new CborArray([
                new CborUInt( constrNum ),
                fields
            ]);
        }

        return new CborTag(
            tag,
            fields
        )
    }
    if( data instanceof DataMap )
    {
        return new CborMap(
            data.map.map( pair => {
                return {
                    k: dataToCborObj( pair.fst ),
                    v: dataToCborObj( pair.snd )
                }
            })
        );
    }
    if( data instanceof DataList )
    {
        return new CborArray(
            data.list.map( dataToCborObj )
        );
    }
    if( data instanceof DataI )
    {
        const n = data.int.asBigInt;

        return (
            n < 0 ?
            new CborNegInt( n ) :
            new CborUInt( n )
        );
    }
    if( data instanceof DataB )
    {
        return new CborBytes(
            data.bytes.asBytes
        );
    }

    /**
     * @fixme change with more specific error
    */
    throw new BasePlutsError(
        "'dataToCborObj' did not match any possible Data constructor"
    );
}

export default function dataToCbor( data: Data ): CborString
{
    return Cbor.encode( dataToCborObj( data ) );
}