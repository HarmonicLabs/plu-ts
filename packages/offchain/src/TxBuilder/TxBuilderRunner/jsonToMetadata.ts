import { TxMetadatum, TxMetadatumBytes, TxMetadatumInt, TxMetadatumList, TxMetadatumMap, TxMetadatumMapEntry, TxMetadatumText } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { fromHex } from "@harmoniclabs/uint8array-utils";

export function jsonToMetadata( json: any, withConversion: boolean = false ): TxMetadatum
{
    if( typeof json === "number" || typeof json === "bigint" ) return new TxMetadatumInt( json );
    if( typeof json === "string" )
    {
        if( withConversion && json.startsWith("0x") )
        {
            return new TxMetadatumBytes( fromHex( json.slice( 2 ) ) );
        }
        return new TxMetadatumText( json );
    }
    if( Array.isArray( json ) )
    {
        return new TxMetadatumList(
            json.map( el => jsonToMetadata( el, withConversion ) )
        );
    }
    if( isObject( json ) )
    {
        const keys = Object.keys( json );
        const len = keys.length;
        const entries: TxMetadatumMapEntry[] = new Array( len );

        for(let i = 0; i < len; i++)
        {
            const ki = keys[i];
            entries[i] = {
                k: jsonToMetadata( ki, withConversion ),
                v: jsonToMetadata( json[ki], withConversion )
            };
        }

        return new TxMetadatumMap( entries )
    }

    throw new Error("unexpected tx metatada json");
}