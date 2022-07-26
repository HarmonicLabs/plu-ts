/**
 * # 5 Built in types, functions, and values
 * 
 * Plutus Core comes with a predefined set of built-in types and functions which will be useful
 * for blockchain applications. 
 * 
 * The set of built-ins is fixed, although in future we may provide a
 * framework to allow customisation for specialised blockchains.
 * 
 * There are four basic types: unit, bool, integer, and bytestring (and strings only for debugging purposes)
 * 
 * These types are given in Figure 13: 
 * 
 * for example (con integer) is the type of signed integers.
 * 
 * We provide standard arithmetic and comparison operations for integers and a number of list-like functions for bytestrings.
 * 
 * The details are given in Figure 14, using a number of abbreviations given in Figure 12.
 * 
 * Note the following:
 *  
 *  •   Some of the entries in Figure 14 contain success conditions. If a success condition is violated
 *      then the function immediately returns (error).
 *  
 *  •   Every built-in function returns either a value or the term (error).
 *  
 *  •   The ifThenElse operation is polymorphic and must be instantiated with the type of its
 *      branches before being applied: see the example below.
 *  
 *  •   We provide two versions of the division and remainder operations for integers. These differ
 *      in their treatment of negative arguments.
 */


import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import JsRuntime from "../../../../../utils/JsRuntime";
import UPLCBuiltinTag, { isUPLCBuiltinTag } from "./UPLCBuiltinTag";


export default class Builtin
    implements UPLCSerializable
{
    private static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0111" )
        );
    }

    private _tag: UPLCBuiltinTag;

    get tag(): UPLCBuiltinTag
    {
        return this._tag;
    }

    constructor( tag: UPLCBuiltinTag )
    {
        JsRuntime.assert(
            isUPLCBuiltinTag( tag ),
            "cannot instatinitate a 'Builtin' using tag: " + tag.toString()
        );
    }

    toUPLCBitStream(): BitStream
    {
    }
}