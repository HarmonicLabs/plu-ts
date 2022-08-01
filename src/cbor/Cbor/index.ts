/*

 
*/
import { Buffer } from "buffer";
import CborString from "../CborString";
import JsonCbor from "../JsonCbor";

/**
 * static class that allows CBOR encoding and decoding
 * 
 * >**_NOTE:_** some tags that are not defined in the proper CBOR specification are automaticaly treated as PlutusData
 */
export default class Cbor
{
    private constructor() {}; // static class, working as namespace

    public static parse( cbor: CborString | Buffer ): JsonCbor
    {
        let _tmp_bytes = cbor;

        if( cbor instanceof CborString )
        {
            _tmp_bytes = cbor.asBytes;
        }

        const bytes = _tmp_bytes;

        //...

    }

    public static encode( jsonCbor: JsonCbor ): CborString
    {

    }
}