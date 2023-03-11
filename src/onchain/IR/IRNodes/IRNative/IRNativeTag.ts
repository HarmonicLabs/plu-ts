
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
    verifySchnorrSecp256k1Signature = 53,


    ////////////////////////////////////////////////////////////////////////////////
    // -------------------------------------------------------------------------- //
    // -------------------------- here starts the fun  -------------------------- //
    // -------------------------------------------------------------------------- //
    ////////////////////////////////////////////////////////////////////////////////

    z_comb              = -1, // useful to understand when we are going recursive during optimizations
    _matchList          = -2,
    /** precursiveList */
    _recList            = -3,
    _indexList          = -4,
    _foldr              = -5,
    _foldl              = -6,
    _find               = -7,
    _length             = -8,
    _some               = -9,
    _every              = -10,
    _filter             = -11,
    _fstPair            = -12,
    _sndPair            = -13,
    _id                 = -14,
    _not                = -15,
    _strictAnd          = -16,      
    _and                = -17,      
    _strictOr           = -18,      
    _or                 = -19,
    _gtBS               = -20,
    _gtEqBS             = -21,
    _gtInt              = -22,
    _gtEqInt            = -23,
    _matchSingleCtor    = -24,
    _matchStruct        = -25
    // TODO data conversion
}