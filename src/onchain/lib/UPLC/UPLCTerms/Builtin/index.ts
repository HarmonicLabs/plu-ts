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
import UPLCBuiltinTag, { isUPLCBuiltinTag, uplcBuiltinTagToBitStream } from "./UPLCBuiltinTag";


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

        this._tag = tag;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Builtin.UPLCTag;
        result.append(
            uplcBuiltinTagToBitStream( this._tag )
        );
        return result;
    }

    static get addInteger()        { return new Builtin( UPLCBuiltinTag.addInteger ) }
    static get subtractInteger()   { return new Builtin( UPLCBuiltinTag.subtractInteger ) }
    static get multiplyInteger()   { return new Builtin( UPLCBuiltinTag.multiplyInteger ) }
    static get divideInteger()     { return new Builtin( UPLCBuiltinTag.divideInteger ) }
    static get quotientInteger()   { return new Builtin( UPLCBuiltinTag.quotientInteger ) }
    static get remainderInteger()  { return new Builtin( UPLCBuiltinTag.remainderInteger ) }
    static get modInteger()        { return new Builtin( UPLCBuiltinTag.modInteger ) }
    // integers comparison operaitons
    static get equalsInteger()        { return new Builtin( UPLCBuiltinTag.equalsInteger ) }
    static get lessThanInteger()      { return new Builtin( UPLCBuiltinTag.lessThanInteger ) }
    static get lessThanEqualInteger() { return new Builtin( UPLCBuiltinTag.lessThanEqualInteger ) }
    // bytestring operations
    static get appendByteString()     { return new Builtin( UPLCBuiltinTag.appendByteString ) }
    static get consByteString()       { return new Builtin( UPLCBuiltinTag.consByteString ) }
    static get sliceByteString()      { return new Builtin( UPLCBuiltinTag.sliceByteString ) }
    static get lengthOfByteString()   { return new Builtin( UPLCBuiltinTag.lengthOfByteString ) }
    static get indexByteString()      { return new Builtin( UPLCBuiltinTag.indexByteString ) }
    // bytestrign comparison operations
    static get equalsByteString()         { return new Builtin( UPLCBuiltinTag.equalsByteString ) }
    static get lessThanByteString()       { return new Builtin( UPLCBuiltinTag.lessThanByteString ) }
    static get lessThanEqualsByteString() { return new Builtin( UPLCBuiltinTag.lessThanEqualsByteString ) }
    // hashes
    static get sha2_256()                 { return new Builtin( UPLCBuiltinTag.sha2_256 ) }
    static get sha3_256()                 { return new Builtin( UPLCBuiltinTag.sha3_256 ) }
    static get blake2b_256()              { return new Builtin( UPLCBuiltinTag.blake2b_256 ) }
    static get verifyEd25519Signature()   { return new Builtin( UPLCBuiltinTag.verifyEd25519Signature ) }
    // string operations
    static get appendString()         { return new Builtin( UPLCBuiltinTag.appendString ) }
    static get equalsString()         { return new Builtin( UPLCBuiltinTag.equalsString ) }
    static get encodeUtf8()           { return new Builtin( UPLCBuiltinTag.encodeUtf8 ) }
    static get decodeUtf8()           { return new Builtin( UPLCBuiltinTag.decodeUtf8 ) }
    // control flow
    static get ifThenElse()           { return new Builtin( UPLCBuiltinTag.ifThenElse ) }
    static get chooseUnit()           { return new Builtin( UPLCBuiltinTag.chooseUnit ) }
    // tracing
    static get trace()                { return new Builtin( UPLCBuiltinTag.trace ) }
    // data
    static get fstPair()              { return new Builtin( UPLCBuiltinTag.fstPair ) }
    static get sndPair()              { return new Builtin( UPLCBuiltinTag.sndPair ) }
    static get chooseList()           { return new Builtin( UPLCBuiltinTag.chooseList ) }
    static get mkCons()               { return new Builtin( UPLCBuiltinTag.mkCons ) }
    static get headList()             { return new Builtin( UPLCBuiltinTag.headList ) }
    static get tailList()             { return new Builtin( UPLCBuiltinTag.tailList ) }
    static get nullList()             { return new Builtin( UPLCBuiltinTag.nullList ) }
    static get chooseData()           { return new Builtin( UPLCBuiltinTag.chooseData ) }
    static get constrData()           { return new Builtin( UPLCBuiltinTag.constrData ) }
    static get mapData()              { return new Builtin( UPLCBuiltinTag.mapData ) }
    static get listData()             { return new Builtin( UPLCBuiltinTag.listData ) }
    static get iData()                { return new Builtin( UPLCBuiltinTag.iData ) }
    static get bData()                { return new Builtin( UPLCBuiltinTag.bData ) }
    static get unConstrData()         { return new Builtin( UPLCBuiltinTag.unConstrData ) }
    static get unMapData()            { return new Builtin( UPLCBuiltinTag.unMapData ) }
    static get unListData()           { return new Builtin( UPLCBuiltinTag.unListData ) }
    static get unIData()              { return new Builtin( UPLCBuiltinTag.unIData ) }
    static get unBData()              { return new Builtin( UPLCBuiltinTag.unBData ) }
    static get equalsData()           { return new Builtin( UPLCBuiltinTag.equalsData ) }
    static get mkPairData()           { return new Builtin( UPLCBuiltinTag.mkPairData ) }
    static get mkNilData()            { return new Builtin( UPLCBuiltinTag.mkNilData ) }
    static get mkNilPairData()        { return new Builtin( UPLCBuiltinTag.mkNilPairData ) }
    // Vasil (Plutus V2)
    static get serialiseData()                   { return new Builtin( UPLCBuiltinTag.serialiseData ) }
    static get verifyEcdsaSecp256k1Signature()   { return new Builtin( UPLCBuiltinTag.verifyEcdsaSecp256k1Signature ) }
    static get verifySchnorrSecp256k1Signature() { return new Builtin( UPLCBuiltinTag.verifySchnorrSecp256k1Signature ) }
}