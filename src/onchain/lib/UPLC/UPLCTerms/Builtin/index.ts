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


import UPLCSerializable, { RawUPLCSerializationContex, UPLCSerializationContex } from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import Debug from "../../../../../utils/Debug";
import JsRuntime from "../../../../../utils/JsRuntime";
import UPLCBuiltinTag, { getNRequiredForces, isUPLCBuiltinTag, uplcBuiltinTagToBitStream } from "./UPLCBuiltinTag";


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

    toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    {
        const result = BitStream.fromBinStr(
            "0101".repeat( getNRequiredForces( this._tag ) ) // "force" tag repeated as necessary
        );

        result.append(
            Builtin.UPLCTag
        );
        
        result.append(
            uplcBuiltinTagToBitStream( this._tag )
        );

        // previous BitStreams creation do no require the context;
        // this allows only a single update before return
        ctx.updateWithBitStreamAppend( result );
        return result;
    }

    static get addInteger(): Builtin        { return new Builtin( UPLCBuiltinTag.addInteger ) }
    static get subtractInteger(): Builtin   { return new Builtin( UPLCBuiltinTag.subtractInteger ) }
    static get multiplyInteger(): Builtin   { return new Builtin( UPLCBuiltinTag.multiplyInteger ) }
    static get divideInteger(): Builtin     { return new Builtin( UPLCBuiltinTag.divideInteger ) }
    static get quotientInteger(): Builtin   { return new Builtin( UPLCBuiltinTag.quotientInteger ) }
    static get remainderInteger(): Builtin  { return new Builtin( UPLCBuiltinTag.remainderInteger ) }
    static get modInteger(): Builtin        { return new Builtin( UPLCBuiltinTag.modInteger ) }
    // integers comparison operaitons: Builtin
    static get equalsInteger(): Builtin        { return new Builtin( UPLCBuiltinTag.equalsInteger ) }
    static get lessThanInteger(): Builtin      { return new Builtin( UPLCBuiltinTag.lessThanInteger ) }
    static get lessThanEqualInteger(): Builtin { return new Builtin( UPLCBuiltinTag.lessThanEqualInteger ) }
    // bytestring operations
    static get appendByteString(): Builtin     { return new Builtin( UPLCBuiltinTag.appendByteString ) }
    static get consByteString(): Builtin       { return new Builtin( UPLCBuiltinTag.consByteString ) }
    static get sliceByteString(): Builtin      { return new Builtin( UPLCBuiltinTag.sliceByteString ) }
    static get lengthOfByteString(): Builtin   { return new Builtin( UPLCBuiltinTag.lengthOfByteString ) }
    static get indexByteString(): Builtin      { return new Builtin( UPLCBuiltinTag.indexByteString ) }
    // bytestrign comparison operations: Builtin
    static get equalsByteString(): Builtin         { return new Builtin( UPLCBuiltinTag.equalsByteString ) }
    static get lessThanByteString(): Builtin       { return new Builtin( UPLCBuiltinTag.lessThanByteString ) }
    static get lessThanEqualsByteString(): Builtin { return new Builtin( UPLCBuiltinTag.lessThanEqualsByteString ) }
    // hashes
    static get sha2_256(): Builtin                 { return new Builtin( UPLCBuiltinTag.sha2_256 ) }
    static get sha3_256(): Builtin                 { return new Builtin( UPLCBuiltinTag.sha3_256 ) }
    static get blake2b_256(): Builtin              { return new Builtin( UPLCBuiltinTag.blake2b_256 ) }
    static get verifyEd25519Signature(): Builtin   { return new Builtin( UPLCBuiltinTag.verifyEd25519Signature ) }
    // string operations
    static get appendString(): Builtin         { return new Builtin( UPLCBuiltinTag.appendString ) }
    static get equalsString(): Builtin         { return new Builtin( UPLCBuiltinTag.equalsString ) }
    static get encodeUtf8(): Builtin           { return new Builtin( UPLCBuiltinTag.encodeUtf8 ) }
    static get decodeUtf8(): Builtin           { return new Builtin( UPLCBuiltinTag.decodeUtf8 ) }
    // control flow
    static get ifThenElse(): Builtin           { return new Builtin( UPLCBuiltinTag.ifThenElse ) }
    static get chooseUnit(): Builtin           { return new Builtin( UPLCBuiltinTag.chooseUnit ) }
    // tracing
    static get trace(): Builtin                { return new Builtin( UPLCBuiltinTag.trace ) }
    // data
    static get fstPair(): Builtin              { return new Builtin( UPLCBuiltinTag.fstPair ) }
    static get sndPair(): Builtin              { return new Builtin( UPLCBuiltinTag.sndPair ) }
    static get chooseList(): Builtin           { return new Builtin( UPLCBuiltinTag.chooseList ) }
    static get mkCons(): Builtin               { return new Builtin( UPLCBuiltinTag.mkCons ) }
    static get headList(): Builtin             { return new Builtin( UPLCBuiltinTag.headList ) }
    static get tailList(): Builtin             { return new Builtin( UPLCBuiltinTag.tailList ) }
    static get nullList(): Builtin             { return new Builtin( UPLCBuiltinTag.nullList ) }
    static get chooseData(): Builtin           { return new Builtin( UPLCBuiltinTag.chooseData ) }
    static get constrData(): Builtin           { return new Builtin( UPLCBuiltinTag.constrData ) }
    static get mapData(): Builtin              { return new Builtin( UPLCBuiltinTag.mapData ) }
    static get listData(): Builtin             { return new Builtin( UPLCBuiltinTag.listData ) }
    static get iData(): Builtin                { return new Builtin( UPLCBuiltinTag.iData ) }
    static get bData(): Builtin                { return new Builtin( UPLCBuiltinTag.bData ) }
    static get unConstrData(): Builtin         { return new Builtin( UPLCBuiltinTag.unConstrData ) }
    static get unMapData(): Builtin            { return new Builtin( UPLCBuiltinTag.unMapData ) }
    static get unListData(): Builtin           { return new Builtin( UPLCBuiltinTag.unListData ) }
    static get unIData(): Builtin              { return new Builtin( UPLCBuiltinTag.unIData ) }
    static get unBData(): Builtin              { return new Builtin( UPLCBuiltinTag.unBData ) }
    static get equalsData(): Builtin           { return new Builtin( UPLCBuiltinTag.equalsData ) }
    static get mkPairData(): Builtin           { return new Builtin( UPLCBuiltinTag.mkPairData ) }
    static get mkNilData(): Builtin            { return new Builtin( UPLCBuiltinTag.mkNilData ) }
    static get mkNilPairData(): Builtin        { return new Builtin( UPLCBuiltinTag.mkNilPairData ) }
    // Vasil (Plutus V2: Builtin)
    static get serialiseData(): Builtin                   { return new Builtin( UPLCBuiltinTag.serialiseData ) }
    static get verifyEcdsaSecp256k1Signature(): Builtin   { return new Builtin( UPLCBuiltinTag.verifyEcdsaSecp256k1Signature ) }
    static get verifySchnorrSecp256k1Signature(): Builtin { return new Builtin( UPLCBuiltinTag.verifySchnorrSecp256k1Signature ) }
}