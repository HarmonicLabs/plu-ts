import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirExpr } from "./ITirExpr";
import { IRNativeTag } from "../../../IR/IRNodes/IRNative/IRNativeTag";
import { IRFunc, IRNative, IRTerm } from "../../../IR";
import { TirFuncT, TirLinearMapT, TirListT, TirUnConstrDataResultT, TirDataOptT, TirPairDataT } from "../types/TirNativeType";
import { bool_t, bytes_t, data_t, int_t, string_t, void_t } from "../program/stdScope/stdScope";
import { TirType } from "../types/TirType";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirNativeFunc
    implements ITirExpr
{
    constructor(
        readonly tag: IRNativeTag,
        readonly type: TirFuncT
    ) { }

    toIR(ctx: ToIRTermCtx): IRTerm {
        return new IRNative(this.tag);
    }

    get range(): SourceRange { return SourceRange.unknown; }

    deps(): string[] { return []; }

    get isConstant(): boolean { return true; }

    // Integer operations
    static get addInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.addInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }
    static get subtractInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.subtractInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }
    static get multiplyInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.multiplyInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }
    static get divideInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.divideInteger,
            new TirFuncT([
                // numerator
                int_t,
                // denominator
                int_t
            ], int_t)
        );
    }
    static get quotientInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.quotientInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }
    static get remainderInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.remainderInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }
    static get modInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.modInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], int_t)
        );
    }

    static get equalsInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.equalsInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], bool_t)
        );
    }
    static get lessThanInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.lessThanInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], bool_t)
        );
    }
    static get lessThanEqualInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.lessThanEqualInteger,
            new TirFuncT([
                // a
                int_t,
                // b
                int_t
            ], bool_t)
        );
    }

    // ByteString operations
    static get appendByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.appendByteString,
            new TirFuncT([
                // left
                bytes_t,
                // right
                bytes_t
            ], bytes_t)
        );
    }
    static get consByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.consByteString,
            new TirFuncT([
                // byte
                int_t,
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get sliceByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.sliceByteString,
            new TirFuncT([
                // offset
                int_t,
                // length
                int_t,
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get lengthOfByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.lengthOfByteString,
            new TirFuncT([
                // bytes
                bytes_t
            ], int_t)
        );
    }
    static get indexByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.indexByteString,
            new TirFuncT([
                // bytes
                bytes_t,
                // index
                int_t
            ], int_t)
        );
    }
    static get equalsByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.equalsByteString,
            new TirFuncT([
                // a
                bytes_t,
                // b
                bytes_t
            ], bool_t)
        );
    }
    static get lessThanByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.lessThanByteString,
            new TirFuncT([
                // a
                bytes_t,
                // b
                bytes_t
            ], bool_t)
        );
    }
    static get lessThanEqualsByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.lessThanEqualsByteString,
            new TirFuncT([
                // a
                bytes_t,
                // b
                bytes_t
            ], bool_t)
        );
    }

    // Hashing operations
    static get sha2_256(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.sha2_256,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get sha3_256(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.sha3_256,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get blake2b_256(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.blake2b_256,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get verifyEd25519Signature(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.verifyEd25519Signature,
            new TirFuncT([
                // pubKey
                bytes_t,
                // message
                bytes_t,
                // signature
                bytes_t
            ], bool_t)
        );
    }

    // Control flow functions that need type parameters
    static strictIfThenElse(returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.strictIfThenElse,
            new TirFuncT([
                // condition
                bool_t,
                // thenValue
                returnT,
                // elseValue
                returnT
            ], returnT)
        );
    }
    static chooseUnit(returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.chooseUnit,
            new TirFuncT([
                // unit
                void_t
            ], returnT)
        );
    }
    static strictChooseList(elemT: TirType, returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.strictChooseList,
            new TirFuncT([
                // list
                new TirListT(elemT),
                // caseNil
                returnT,
                // caseCons
                returnT
            ], returnT)
        );
    }

    // List operations with type parameters
    static mkCons(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.mkCons,
            new TirFuncT([
                // head
                elemT,
                // tail
                new TirListT(elemT)
            ], new TirListT(elemT))
        );
    }
    static headList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.headList,
            new TirFuncT([
                // list
                new TirListT(elemT)
            ], elemT)
        );
    }
    static tailList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.tailList,
            new TirFuncT([
                // list
                new TirListT(elemT)
            ], new TirListT(elemT))
        );
    }
    static nullList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.nullList,
            new TirFuncT([
                // list
                new TirListT(elemT)
            ], bool_t)
        );
    }

    // Data operations with return type parameters
    static chooseData(returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.chooseData,
            new TirFuncT([
                // data
                data_t,
                // caseConstr
                returnT,
                // caseMap
                returnT,
                // caseList
                returnT,
                // caseIData
                returnT,
                // caseBData
                returnT
            ], returnT)
        );
    }
    static get constrData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.constrData,
            new TirFuncT([
                // tag
                int_t,
                // fields
                new TirListT(data_t)
            ], data_t)
        );
    }
    static get mapData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.mapData,
            new TirFuncT([
                // map
                new TirLinearMapT(data_t, data_t)
            ], data_t)
        );
    }
    static get listData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.listData,
            new TirFuncT([
                // list
                new TirListT(data_t)
            ], data_t)
        );
    }
    static get iData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.iData,
            new TirFuncT([
                // int
                int_t
            ], data_t)
        );
    }
    static get bData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bData,
            new TirFuncT([
                // bytes
                bytes_t
            ], data_t)
        );
    }

    // Data unwrapping operations
    static get unConstrData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.unConstrData,
            new TirFuncT([
                // data
                data_t
            ], new TirUnConstrDataResultT())
        );
    }
    static get unMapData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.unMapData,
            new TirFuncT([
                // data
                data_t
            ], new TirLinearMapT( data_t, data_t ) )
        );
    }
    static get unListData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.unListData,
            new TirFuncT([
                // data
                data_t
            ], new TirListT(data_t))
        );
    }
    static get unIData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.unIData,
            new TirFuncT([
                // data
                data_t
            ], int_t)
        );
    }
    static get unBData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.unBData,
            new TirFuncT([
                // data
                data_t
            ], bytes_t)
        );
    }

    // Data comparison
    static get equalsData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.equalsData,
            new TirFuncT([
                // a
                data_t,
                // b
                data_t
            ], bool_t)
        );
    }

    static get mkNilData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.mkNilData,
            new TirFuncT([], new TirListT(data_t))
        );
    }
    static get serialiseData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.serialiseData,
            new TirFuncT([
                // data
                data_t
            ], bytes_t)
        );
    }

    // Cryptography functions
    static get verifyEcdsaSecp256k1Signature(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.verifyEcdsaSecp256k1Signature,
            new TirFuncT([
                // pubKey
                bytes_t,
                // message
                bytes_t,
                // signature
                bytes_t
            ], bool_t)
        );
    }
    static get verifySchnorrSecp256k1Signature(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.verifySchnorrSecp256k1Signature,
            new TirFuncT([
                // pubKey
                bytes_t,
                // message
                bytes_t,
                // signature
                bytes_t
            ], bool_t)
        );
    }

    // BLS12-381 operations
    /* TODO: add bls supprot
    get bls12_381_G1_add(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_add,
            new TirFuncT([bytes_t, bytes_t], bytes_t)
        );
    }
    get bls12_381_G1_neg(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_neg,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G1_scalarMul(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_scalarMul,
            new TirFuncT([bytes_t, int_t], bytes_t)
        );
    }
    get bls12_381_G1_equal(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_equal,
            new TirFuncT([bytes_t, bytes_t], bool_t)
        );
    }
    get bls12_381_G1_hashToGroup(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_hashToGroup,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G1_compress(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_compress,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G1_uncompress(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G1_uncompress,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G2_add(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_add,
            new TirFuncT([bytes_t, bytes_t], bytes_t)
        );
    }
    get bls12_381_G2_neg(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_neg,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G2_scalarMul(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_scalarMul,
            new TirFuncT([bytes_t, int_t], bytes_t)
        );
    }
    get bls12_381_G2_equal(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_equal,
            new TirFuncT([bytes_t, bytes_t], bool_t)
        );
    }
    get bls12_381_G2_hashToGroup(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_hashToGroup,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G2_compress(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_compress,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_G2_uncompress(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_G2_uncompress,
            new TirFuncT([bytes_t], bytes_t)
        );
    }
    get bls12_381_millerLoop(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_millerLoop,
            new TirFuncT([bytes_t, bytes_t], bytes_t)
        );
    }
    get bls12_381_mulMlResult(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_mulMlResult,
            new TirFuncT([bytes_t, bytes_t], bytes_t)
        );
    }
    get bls12_381_finalVerify(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.bls12_381_finalVerify,
            new TirFuncT([bytes_t, bytes_t], bool_t)
        );
    }
    //*/

    // Additional hashing functions
    static get keccak_256(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.keccak_256,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get blake2b_224(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.blake2b_224,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }

    // ByteString manipulation
    static get integerToByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.integerToByteString,
            new TirFuncT([
                // flag
                bool_t,
                // value
                int_t,
                // size
                int_t
            ], bytes_t)
        );
    }
    static get byteStringToInteger(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.byteStringToInteger,
            new TirFuncT([
                // flag
                bool_t,
                // bytes
                bytes_t
            ], int_t)
        );
    }
    static get andByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.andByteString,
            new TirFuncT([
                // flag
                bool_t,
                // a
                bytes_t,
                // b
                bytes_t
            ], bytes_t)
        );
    }
    static get orByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.orByteString,
            new TirFuncT([
                // flag
                bool_t,
                // a
                bytes_t,
                // b
                bytes_t
            ], bytes_t)
        );
    }
    static get xorByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.xorByteString,
            new TirFuncT([
                // flag
                bool_t,
                // a
                bytes_t,
                // b
                bytes_t
            ], bytes_t)
        );
    }
    static get complementByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.complementByteString,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }
    static get readBit(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.readBit,
            new TirFuncT([
                // bytes
                bytes_t,
                // index
                int_t
            ], bool_t)
        );
    }
    static get writeBits(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.writeBits,
            new TirFuncT([
                // bytes
                bytes_t,
                // positions
                new TirListT( int_t ),
                // value
                bool_t
            ], bytes_t)
        );
    }

    // Additional ByteString operations
    static get replicateByte(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.replicateByte,
            new TirFuncT([
                // count
                int_t,
                // byte
                int_t
            ], bytes_t)
        );
    }
    static get shiftByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.shiftByteString,
            new TirFuncT([
                // bytes
                bytes_t,
                // shift
                int_t
            ], bytes_t)
        );
    }
    static get rotateByteString(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.rotateByteString,
            new TirFuncT([
                // bytes
                bytes_t,
                // amount
                int_t
            ], bytes_t)
        );
    }
    static get countSetBits(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.countSetBits,
            new TirFuncT([
                // bytes
                bytes_t
            ], int_t)
        );
    }
    static get findFirstSetBit(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.findFirstSetBit,
            new TirFuncT([
                // bytes
                bytes_t
            ], int_t)
        );
    }
    static get ripemd_160(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag.ripemd_160,
            new TirFuncT([
                // bytes
                bytes_t
            ], bytes_t)
        );
    }

    // Custom utility functions
    static _dropList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._dropList,
            new TirFuncT([
                // n
                int_t,
                // list
                new TirListT(elemT)
            ], new TirListT(elemT))
        );
    }
    static _indexList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._indexList,
            new TirFuncT([
                // list
                new TirListT(elemT),
                // index
                int_t
            ], elemT)
        );
    }
    static _foldr(elemT: TirType, returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._foldr,
            new TirFuncT([
                // reduce function
                new TirFuncT([
                    elemT,
                    returnT
                ], returnT),
                // initial accumulator
                returnT,
                // list to fold
                new TirListT(elemT)
            ], returnT)
        );
    }
    static _foldl(elemT: TirType, returnT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._foldl,
            new TirFuncT([
                // reduce function
                new TirFuncT([
                    returnT,
                    elemT
                ], returnT),
                // initial accumulator
                returnT,
                // list to fold
                new TirListT(elemT)
            ], returnT)
        );
    }
    static _mkFindDataOptional(elems_t: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._mkFindDataOptional,
            new TirFuncT([
                // elem -> data
                new TirFuncT([ elems_t ], data_t),
                // elem -> bool (predicate)
                new TirFuncT([ elems_t ], bool_t),
                // List<elem>
                new TirListT(elems_t)
            ], new TirDataOptT(elems_t))
        );
    }
    static _length(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._length,
            new TirFuncT([
                // list
                new TirListT(elemT)
            ], int_t)
        );
    }
    static _some(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._some,
            new TirFuncT([
                // predicate
                new TirFuncT([
                    elemT
                ], bool_t),
                // list
                new TirListT(elemT)
            ], bool_t)
        );
    }
    static _every(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._every,
            new TirFuncT([
                // predicate
                new TirFuncT([
                    elemT
                ], bool_t),
                // list
                new TirListT(elemT)
            ], bool_t)
        );
    }
    static _mkFilter(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._mkFilter,
            new TirFuncT([
                // pnilOfType: an empty list with the right element type
                new TirListT(elemT),
                // predicate
                new TirFuncT([
                    elemT
                ], bool_t),
                // list to filter
                new TirListT(elemT)
            ], new TirListT(elemT))
        );
    }
    static _id(t: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._id,
            new TirFuncT([ t ], t)
        );
    }
    static get _not(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._not,
            new TirFuncT([
                // bool
                bool_t
            ], bool_t)
        );
    }
    static get _strictAnd(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._strictAnd,
            new TirFuncT([
                bool_t,
                bool_t
            ], bool_t)
        );
    }
    static get _and(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._and,
            new TirFuncT([
                bool_t,
                bool_t
            ], bool_t)
        );
    }
    static get _strictOr(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._strictOr,
            new TirFuncT([
                bool_t,
                bool_t
            ], bool_t)
        );
    }
    static get _or(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._or,
            new TirFuncT([
                bool_t,
                bool_t
            ], bool_t)
        );
    }
    static get _gtBS(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._gtBS,
            new TirFuncT([
                bytes_t,
                bytes_t
            ], bool_t)
        );
    }
    static get _gtEqBS(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._gtEqBS,
            new TirFuncT([
                bytes_t,
                bytes_t
            ], bool_t)
        );
    }
    static get _gtInt(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._gtInt,
            new TirFuncT([
                int_t,
                int_t
            ], bool_t)
        );
    }
    static get _gtEqInt(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._gtEqInt,
            new TirFuncT([
                int_t,
                int_t
            ], bool_t)
        );
    }
    static get _pairDataToData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._pairDataToData,
            new TirFuncT([
                // pair
                new TirPairDataT()
            ], data_t)
        );
    }
    static get _pairDataFromData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._pairDataFromData,
            new TirFuncT([
                // data
                data_t
            ], new TirPairDataT())
        );
    }
    static _mkEqualsList(elemT: TirType): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._mkEqualsList,
            new TirFuncT([
                // elem equality
                new TirFuncT([
                    elemT,
                    elemT
                ], bool_t),
                // listA
                new TirListT(elemT),
                // listB
                new TirListT(elemT)
            ], bool_t)
        );
    }
    static get _equalPairData(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._equalPairData,
            new TirFuncT([
                // pairA
                new TirPairDataT(),
                // pairB
                new TirPairDataT()
            ], bool_t)
        );
    }
    static get _equalBoolean(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._equalBoolean,
            new TirFuncT([
                // a
                bool_t,
                // b
                bool_t
            ], bool_t)
        );
    }
    static get _negateInt(): TirNativeFunc {
        return new TirNativeFunc(
            IRNativeTag._negateInt,
            new TirFuncT([
                // n
                int_t
            ], int_t)
        );
    }
}