import { builtinTagToString } from "@harmoniclabs/uplc";

/**
 * we use positive for natives which map to `UPLCBuiltin`
 * possibly keeping the same number
 * 
 * we use negatives for natives of the `std::fn` family
 * since there is no negative `UPLCBuiltin` tag
 */
export const enum IRNativeTag {
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
    strictIfThenElse            = 26, // 0011010
    chooseUnit                  = 27, // 0011011
    // tracing
    trace                       = 28, // 0011100
    // data
    fstPair                     = 29, // 0011101
    sndPair                     = 30, // 0011110
    strictChooseList            = 31, // 0011111
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
    verifySchnorrSecp256k1Signature = 53,
    // Plutus V3
    bls12_381_G1_add                = 54,
    bls12_381_G1_neg                = 55,
    bls12_381_G1_scalarMul          = 56,
    bls12_381_G1_equal              = 57,
    bls12_381_G1_hashToGroup        = 58,
    bls12_381_G1_compress           = 59,
    bls12_381_G1_uncompress         = 60,
    bls12_381_G2_add                = 61,
    bls12_381_G2_neg                = 62,
    bls12_381_G2_scalarMul          = 63,
    bls12_381_G2_equal              = 64,
    bls12_381_G2_hashToGroup        = 65,
    bls12_381_G2_compress           = 66,
    bls12_381_G2_uncompress         = 67,
    bls12_381_millerLoop            = 68,
    bls12_381_mulMlResult           = 69,
    bls12_381_finalVerify           = 70,
    keccak_256                      = 71,
    blake2b_224                     = 72,
    // bitwise
    integerToByteString             = 73,
    byteStringToInteger             = 74,

    ////////////////////////////////////////////////////////////////////////////////
    // -------------------------------------------------------------------------- //
    // -------------------------- here starts the fun  -------------------------- //
    // -------------------------------------------------------------------------- //
    ////////////////////////////////////////////////////////////////////////////////

    /** @deprecated */
    z_comb              = -1, // useful to understand when we are going recursive during optimizations
    _matchList          = -2,
    _recursiveList      = -3,
    _dropList          = -4,
    _indexList          = -5,
    _foldr              = -6,
    _foldl              = -7,
    _mkFindData               = -8,
    _length             = -9,
    _some               = -10,
    _every              = -11,
    _mkFilter             = -12,
    // _fstPair            = -13,
    // _sndPair            = -14,
    _id                 = -15,
    _not                = -16,  
    _strictAnd          = -17,  
    _and                = -18,  
    _strictOr           = -19,
    _or                 = -20,
    _gtBS               = -21,
    _gtEqBS             = -22,
    _gtInt              = -23,
    _gtEqInt            = -24,
    _strToData          = -25,
    _pairDataToData         = -26,
    _strFromData        = -27,
    _pairDataFromData       = -28,
    /** @deprecated */
    _lazyChooseList     = -29,
    /** @deprecated */
    _lazyIfThenElse     = -30
}

export function nativeTagToString( nativeTag: IRNativeTag ): string
{
    if( nativeTag >= 0 ) return builtinTagToString( nativeTag as any );
    switch( nativeTag )
    {
        case IRNativeTag.z_comb         : return "z_comb";
        case IRNativeTag._matchList     : return "matchList";
        case IRNativeTag._recursiveList : return "recursiveList";
        case IRNativeTag._dropList      : return "dropList";
        case IRNativeTag._indexList     : return "indexList";
        case IRNativeTag._foldr         : return "foldr";
        case IRNativeTag._foldl         : return "foldl";
        case IRNativeTag._mkFindData          : return "mkFind";
        case IRNativeTag._length        : return "length";
        case IRNativeTag._some          : return "some";
        case IRNativeTag._every         : return "every";
        case IRNativeTag._mkFilter        : return "mkFilter";
        // case IRNativeTag._fstPair       : return "fstPair";
        // case IRNativeTag._sndPair       : return "sndPair";
        case IRNativeTag._id            : return "id";
        case IRNativeTag._not           : return "not";
        case IRNativeTag._strictAnd     : return "strictAnd";
        case IRNativeTag._and           : return "and";
        case IRNativeTag._strictOr      : return "strictOr";
        case IRNativeTag._or            : return "or";
        case IRNativeTag._gtBS          : return "gtBS";
        case IRNativeTag._gtEqBS        : return "gtEqBS";
        case IRNativeTag._gtInt         : return "gtInt";
        case IRNativeTag._gtEqInt       : return "gtEqInt";
        case IRNativeTag._strToData     : return "strToData";
        case IRNativeTag._pairDataToData    : return "pairToData";
        case IRNativeTag._strFromData   : return "strFromData";
        case IRNativeTag._pairDataFromData  : return "pairFromData";
        case IRNativeTag._lazyChooseList: return "lazyChooseList";


        default: return ""
    }
}