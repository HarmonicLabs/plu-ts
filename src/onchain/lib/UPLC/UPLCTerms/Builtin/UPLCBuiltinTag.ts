import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import JsRuntime from "../../../../../utils/JsRuntime";

export type UPLCBuiltinTagNumber
    = 0  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  
    | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 
    | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 
    | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 
    | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 
    | 50 | 51 | 52 | 53 ;

// export default below
/**
 * to encode as 7-bits
 */
const enum UPLCBuiltinTag {
    // integers monoidal operations
    addInteger                  = 0,  // 0000000
    subtractInteger             = 1,  // 0000001
    multiplyInteger             = 2,  // 0000010
    divideInteger               = 3,  // 0000011
    quotientInteger             = 4,  // 0000100
    remainderInteger            = 5,  // 0000101
    modInteger                  = 6,  // 0000110
    // integers comparison operaitons
    equalsInteger               = 7,  // 0000111
    lessThanInteger             = 8,  // 0001000
    lessThanEqualInteger        = 9,  // 0001001
    // bytestring operations
    appendByteString            = 10, // 0001010
    consByteString              = 11, // 0001011
    sliceByteString             = 12, // 0001100
    lengthOfByteString          = 13, // 0001101
    indexByteString             = 14, // 0001110
    // bytestrign comparison operations
    equalsByteString            = 15, // 0001111
    lessThanByteString          = 16, // 0010000
    lessThanEqualsByteString    = 17, // 0010001
    // hashes
    sha2_256                    = 18, // 0010010
    sha3_256                    = 19, // 0010011
    blake2b_256                 = 20, // 0010100
    verifyEd25519Signature      = 21, // 0010101
    // string operations
    appendString                = 22, // 0010110
    equalsString                = 23, // 0010111
    encodeUtf8                  = 24, // 0011000
    decodeUtf8                  = 25, // 0011001
    // control flow
    ifThenElse                  = 26, // 0011010
    chooseUnit                  = 27, // 0011011
    // tracing
    trace                       = 28, // 0011100
    // data
    fstPair                     = 29, // 0011101
    sndPair                     = 30, // 0011110
    chooseList                  = 31, // 0011111
    mkCons                      = 32, // 0100000
    headList                    = 33, // 0100001
    tailList                    = 34, // 0100010
    nullList                    = 35, // 0100011
    chooseData                  = 36, // 0100100
    constrData                  = 37, // 0100101
    mapData                     = 38, // 0100110
    listData                    = 39, // 0100111
    iData                       = 40, // 0101000
    bData                       = 41, // 0101001
    unConstrData                = 42, // 0101010
    unMapData                   = 43, // 0101011
    unListData                  = 44, // 0101100
    unIData                     = 45, // 0101101
    unBData                     = 46, // 0101110
    equalsData                  = 47, // 0101111
    mkPairData                  = 48, // 0110000
    mkNilData                   = 49, // 0110001
    mkNilPairData               = 50, // 0110010
    // Vasil (Plutus V2)
    serialiseData                   = 51,
    verifyEcdsaSecp256k1Signature   = 52,
    verifySchnorrSecp256k1Signature = 53
}

export default UPLCBuiltinTag;


export function isUPLCBuiltinTag( tag: UPLCBuiltinTag | UPLCBuiltinTagNumber ): boolean
{
    return (
        Math.round( Math.abs( tag ) ) === tag // tag is a non-negative integer
        &&
        (tag >= 0 && tag <= 53)
    );
}

export function getNRequiredForces( tag: UPLCBuiltinTag ): ( 0 | 1 | 2 )
{
    JsRuntime.assert(
        isUPLCBuiltinTag( tag ),
        `in getNRequiredForces; the function is specific for UPLCBuiltinTags; input was: ${tag}`
    );

    // tags from 0 to 25 and from 37 to 53 are all fixed in type; no forces requred
    if(
        tag <= 25 || 
        ( tag >= UPLCBuiltinTag.constrData && tag < 53 )
    ) 
    {
        return 0;
    }

    // tags that do have one type parameter; 1 force
    if(
        tag === UPLCBuiltinTag.ifThenElse ||
        tag === UPLCBuiltinTag.chooseUnit ||
        tag === UPLCBuiltinTag.trace      ||
        tag === UPLCBuiltinTag.mkCons     ||
        tag === UPLCBuiltinTag.headList   ||
        tag === UPLCBuiltinTag.tailList   ||
        tag === UPLCBuiltinTag.nullList   ||
        tag === UPLCBuiltinTag.chooseData
    )
    {
        return 1;
    }

    // tags that do have two types paramters; two forces
    if(
        tag === UPLCBuiltinTag.fstPair ||
        tag === UPLCBuiltinTag.sndPair ||
        tag === UPLCBuiltinTag.chooseList
    )
    {
        return 2;
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "'getNRequiredForces' did not match any tag; the input was: " + tag
    )
}

export function uplcBuiltinTagToBitStream( tag: UPLCBuiltinTag ): BitStream
{
    JsRuntime.assert(
        isUPLCBuiltinTag( tag ),
        `in UPLCBuiltinTagToBitStream; cannot convert ${tag} to builtin, tag not found`
    );
    
    return BitStream.fromBinStr(
        new BinaryString(
            "0101".repeat( getNRequiredForces( tag ) ) +    // "force" tag repeated as necessary
            tag.toString(2).padStart( 7 , '0' )             // builtin tag itself
        )
    );
}

export function isV1Supported( tag: UPLCBuiltinTag | UPLCBuiltinTagNumber ): boolean
{
    return (
        isUPLCBuiltinTag( tag ) &&
        tag <= 50
    );
}

export function isV2Supported( tag: UPLCBuiltinTag | UPLCBuiltinTagNumber ): boolean
{
    return (
        isUPLCBuiltinTag( tag )
    );
}