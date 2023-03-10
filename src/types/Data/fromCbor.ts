import JsRuntime from "../../utils/JsRuntime";

import { CborObj, isCborObj } from "../../cbor/CborObj";
import { Data } from "./Data";
import { CborArray } from "../../cbor/CborObj/CborArray";
import { CborBytes } from "../../cbor/CborObj/CborBytes";
import { CborMap } from "../../cbor/CborObj/CborMap";
import { CborNegInt } from "../../cbor/CborObj/CborNegInt";
import { CborTag } from "../../cbor/CborObj/CborTag";
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { CanBeCborString, CborString, forceCborString } from "../../cbor/CborString";
import { BasePlutsError } from "../../errors/BasePlutsError";
import { DataB } from "./DataB";
import { DataConstr, cborTagToConstrNumber } from "./DataConstr";
import { DataI } from "./DataI";
import { DataList } from "./DataList";
import { DataMap } from "./DataMap";
import { DataPair } from "./DataPair";
import { Cbor } from "../../cbor/Cbor";


export function dataFromCborObj( cborObj: CborObj ): Data
{
    JsRuntime.assert(
        isCborObj( cborObj ),
        "Invalid cborObj to convert to Data"
    );

    if(
        cborObj instanceof CborUInt ||
        cborObj instanceof CborNegInt
    )
    {
        return new DataI( cborObj.num );
    }

    if( cborObj instanceof CborBytes )
    {
        return new DataB( cborObj.buffer )
    }

    if( cborObj instanceof CborArray )
    {
        return new DataList(
            cborObj.array.map( cObj => dataFromCborObj( cObj ) )
        );
    }

    if( cborObj instanceof CborMap )
    {
        return new DataMap(
            cborObj.map.map( entry => {
                return new DataPair(
                    dataFromCborObj( entry.k ),
                    dataFromCborObj( entry.v )
                );
            })
        );
    }

    if( cborObj instanceof CborTag )
    {
        let tag = cborTagToConstrNumber( cborObj.tag );
        let data = cborObj.data;

        if(
            // any unrecognized tag
            tag < BigInt( 0 ) ||
            !(Object.getPrototypeOf( data ) === CborArray.prototype) ||
            !( data instanceof CborArray ) // for typescript to be happy
        )
        {
            // ignore the tag and and treats the object as if it were normal CBOR
            return dataFromCborObj( data )
        }

        if( tag === BigInt( 102 ) )
        {
            JsRuntime.assert(
                data.array.length === 2 &&
                data.array[0] instanceof CborUInt &&
                data.array[1] instanceof CborArray,
                "invalid fileds for cbor tag 102 while constructing DataConstr"
            )

            return new DataConstr(
                ((data as CborArray).array[0] as CborUInt).num,
                ((data as CborArray).array[1] as CborArray).array.map( dataFromCborObj )
            );
        }

        JsRuntime.assert(
            (Object.getPrototypeOf( data ) === CborArray.prototype) &&
            ( data instanceof CborArray ), // for typescript to be happy
            "invalid CBOR fields for DataConstr"
        );

        return new DataConstr(
            tag,
            data.array.map( dataFromCborObj )
        );
    }

    // CborText and CborSimple not supported
    /**
     *  @fixme change to specific ```PlutsError```
     */
    throw new BasePlutsError( "invalid CBOR major type for Data" );
}

export function dataFromCbor( cbor: CanBeCborString ): Data
{
    return dataFromCborObj( Cbor.parse( forceCborString( cbor ) ) );
}