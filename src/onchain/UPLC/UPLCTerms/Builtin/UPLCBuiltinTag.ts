import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import JsRuntime from "../../../../utils/JsRuntime";

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
    // bytestring comparison operations
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

export function builtinTagToString( tag: UPLCBuiltinTag ): string
{
    switch( tag )
        {
            case UPLCBuiltinTag.addInteger :                        return "addInteger";
            case UPLCBuiltinTag.subtractInteger :                   return "subtractInteger";
            case UPLCBuiltinTag.multiplyInteger :                   return "multiplyInteger";
            case UPLCBuiltinTag.divideInteger :                     return "divideInteger";
            case UPLCBuiltinTag.quotientInteger :                   return "quotientInteger";
            case UPLCBuiltinTag.remainderInteger :                  return "remainderInteger";
            case UPLCBuiltinTag.modInteger :                        return "modInteger";
            case UPLCBuiltinTag.equalsInteger :                     return "equalsInteger";
            case UPLCBuiltinTag.lessThanInteger :                   return "lessThanInteger";
            case UPLCBuiltinTag.lessThanEqualInteger :              return "lessThanEqualInteger";
            case UPLCBuiltinTag.appendByteString :                  return "appendByteString";
            case UPLCBuiltinTag.consByteString :                    return "consByteString";
            case UPLCBuiltinTag.sliceByteString :                   return "sliceByteString";
            case UPLCBuiltinTag.lengthOfByteString :                return "lengthOfByteString";
            case UPLCBuiltinTag.indexByteString :                   return "indexByteString";
            case UPLCBuiltinTag.equalsByteString :                  return "equalsByteString";
            case UPLCBuiltinTag.lessThanByteString :                return "lessThanByteString";
            case UPLCBuiltinTag.lessThanEqualsByteString :          return "lessThanEqualsByteString";
            case UPLCBuiltinTag.sha2_256 :                          return "sha2_256";
            case UPLCBuiltinTag.sha3_256 :                          return "sha3_256";
            case UPLCBuiltinTag.blake2b_256 :                       return "blake2b_256";
            case UPLCBuiltinTag.verifyEd25519Signature:             return "verifyEd25519Signature";
            case UPLCBuiltinTag.appendString :                      return "appendString";
            case UPLCBuiltinTag.equalsString :                      return "equalsString";
            case UPLCBuiltinTag.encodeUtf8 :                        return "encodeUtf8";
            case UPLCBuiltinTag.decodeUtf8 :                        return "decodeUtf8";
            case UPLCBuiltinTag.ifThenElse :                        return "ifThenElse";
            case UPLCBuiltinTag.chooseUnit :                        return "chooseUnit";
            case UPLCBuiltinTag.trace :                             return "trace";
            case UPLCBuiltinTag.fstPair :                           return "fstPair";
            case UPLCBuiltinTag.sndPair :                           return "sndPair";
            case UPLCBuiltinTag.chooseList :                        return "chooseList";
            case UPLCBuiltinTag.mkCons :                            return "mkCons";
            case UPLCBuiltinTag.headList :                          return "headList";
            case UPLCBuiltinTag.tailList :                          return "tailList";
            case UPLCBuiltinTag.nullList :                          return "nullList";
            case UPLCBuiltinTag.chooseData :                        return "chooseData";
            case UPLCBuiltinTag.constrData :                        return "constrData";
            case UPLCBuiltinTag.mapData :                           return "mapData";
            case UPLCBuiltinTag.listData :                          return "listData";
            case UPLCBuiltinTag.iData    :                          return "iData";
            case UPLCBuiltinTag.bData    :                          return "bData";
            case UPLCBuiltinTag.unConstrData :                      return "unConstrData";
            case UPLCBuiltinTag.unMapData    :                      return "unMapData";
            case UPLCBuiltinTag.unListData   :                      return "unListData";
            case UPLCBuiltinTag.unIData      :                      return "unIData";
            case UPLCBuiltinTag.unBData      :                      return "unBData";
            case UPLCBuiltinTag.equalsData   :                      return "equalsData";
            case UPLCBuiltinTag.mkPairData   :                      return "mkPairData";
            case UPLCBuiltinTag.mkNilData    :                      return "mkNilData";
            case UPLCBuiltinTag.mkNilPairData:                      return "mkNilPairData";
            case UPLCBuiltinTag.serialiseData:                      return "serialiseData";
            case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:      return "verifyEcdsaSecp256k1Signature";
            case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:    return "verifySchnorrSecp256k1Signature";

            
            default:
                // tag; // check that is of type 'never'
                return "";
        }
}