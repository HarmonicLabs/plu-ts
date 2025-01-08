import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { IHash } from "../../interfaces/IHash";
import { IIRParent } from "../../interfaces/IIRParent";
import { concatUint8Arr } from "../../utils/concatUint8Arr";
import { positiveBigIntAsBytes } from "../../utils/positiveIntAsBytes";
import { IRNativeTag, nativeTagToString } from "./IRNativeTag";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";
import { IRParentTerm, isIRParentTerm } from "../../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "../BaseIRMetadata";
import { ToJson } from "../../../utils/ToJson";
import { hashIrData, IRHash } from "../../IRHash";
import { isObject } from "@harmoniclabs/obj-utils";
import { IRNodeKind } from "../../IRNodeKind";

/**
 * we might not need all the hashes
 * 
 * but one we get one for a specific tag is not worth it re calculate it
 */
const nativeHashesCache: { [n: number/*IRNativeTag*/]: IRHash } = {} as any;

export interface IRNativeMetadata extends BaseIRMetadata {}

/**
 * `IRNative` ⊇ `Builtins` + `std::fn`
**/
export class IRNative
    implements Cloneable<IRNative>, IHash, IIRParent, ToJson
{
    readonly tag!: IRNativeTag;

    static get kind(): IRNodeKind.Native { return IRNodeKind.Native; }
    get kind(): IRNodeKind.Native { return IRNative.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRNative.kind ]); }

    constructor( tag: IRNativeTag )
    {
        this.tag = tag;
    }

    get hash(): IRHash
    {
        if(nativeHashesCache[this.tag] === undefined)
        {
            nativeHashesCache[this.tag] = hashIrData( 
                concatUint8Arr( 
                    IRNative.tag, 
                    positiveBigIntAsBytes(
                        UPLCFlatUtils.zigzagBigint(
                            BigInt( this.tag )
                        )
                    )
                )
            );
        }
        return nativeHashesCache[this.tag];
    }
    markHashAsInvalid(): void 
    { throw new Error("IRNative should never be invalid; 'markHashAsInvalid' called"); }
    isHashPresent(): true { return true; }

    private _meta: IRNativeMetadata | undefined;
    get meta(): IRNativeMetadata
    {
        if( !isObject( this._meta ) ) this._meta = {};
        return this._meta!;
    }

    private _parent: IRParentTerm | undefined = undefined;
    get parent(): IRParentTerm | undefined
    {
        return this._parent;
    }
    set parent( newParent: IRParentTerm | undefined )
    {
        if(!( // assert
            // new parent value is different than current
            this._parent !== newParent && (
                // and the new parent value is valid
                newParent === undefined || 
                isIRParentTerm( newParent )
            )
        )) return;
        
        this._parent = newParent;
    }

    clone(): IRNative
    {
        return new IRNative( this.tag );
    }
    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            type: "IRNative",
            native: nativeTagToString( this.tag )
        };
    }

    static get addInteger() { return new IRNative( IRNativeTag.addInteger ); }
    static get subtractInteger() { return new IRNative( IRNativeTag.subtractInteger ); }
    static get multiplyInteger() { return new IRNative( IRNativeTag.multiplyInteger ); }
    static get divideInteger() { return new IRNative( IRNativeTag.divideInteger ); }
    static get quotientInteger() { return new IRNative( IRNativeTag.quotientInteger ); }
    static get remainderInteger() { return new IRNative( IRNativeTag.remainderInteger ); }
    static get modInteger() { return new IRNative( IRNativeTag.modInteger ); }
    static get equalsInteger() { return new IRNative( IRNativeTag.equalsInteger ); }
    static get lessThanInteger() { return new IRNative( IRNativeTag.lessThanInteger ); }
    static get lessThanEqualInteger() { return new IRNative( IRNativeTag.lessThanEqualInteger ); }
    static get appendByteString() { return new IRNative( IRNativeTag.appendByteString ); }
    static get consByteString() { return new IRNative( IRNativeTag.consByteString ); }
    static get sliceByteString() { return new IRNative( IRNativeTag.sliceByteString ); }
    static get lengthOfByteString() { return new IRNative( IRNativeTag.lengthOfByteString ); }
    static get indexByteString() { return new IRNative( IRNativeTag.indexByteString ); }
    static get equalsByteString() { return new IRNative( IRNativeTag.equalsByteString ); }
    static get lessThanByteString() { return new IRNative( IRNativeTag.lessThanByteString ); }
    static get lessThanEqualsByteString() { return new IRNative( IRNativeTag.lessThanEqualsByteString ); }
    static get sha2_256() { return new IRNative( IRNativeTag.sha2_256 ); }
    static get sha3_256() { return new IRNative( IRNativeTag.sha3_256 ); }
    static get blake2b_256() { return new IRNative( IRNativeTag.blake2b_256 ); }
    static get verifyEd25519Signature() { return new IRNative( IRNativeTag.verifyEd25519Signature ); }
    static get appendString() { return new IRNative( IRNativeTag.appendString ); }
    static get equalsString() { return new IRNative( IRNativeTag.equalsString ); }
    static get encodeUtf8() { return new IRNative( IRNativeTag.encodeUtf8 ); }
    static get decodeUtf8() { return new IRNative( IRNativeTag.decodeUtf8 ); }
    static get strictIfThenElse() { return new IRNative( IRNativeTag.strictIfThenElse ); }
    static get chooseUnit() { return new IRNative( IRNativeTag.chooseUnit ); }
    static get trace() { return new IRNative( IRNativeTag.trace ); }
    static get fstPair() { return new IRNative( IRNativeTag.fstPair ); }
    static get sndPair() { return new IRNative( IRNativeTag.sndPair ); }
    static get strictChooseList() { return new IRNative( IRNativeTag.strictChooseList ); }
    static get mkCons() { return new IRNative( IRNativeTag.mkCons ); }
    static get headList() { return new IRNative( IRNativeTag.headList ); }
    static get tailList() { return new IRNative( IRNativeTag.tailList ); }
    static get nullList() { return new IRNative( IRNativeTag.nullList ); }
    static get chooseData() { return new IRNative( IRNativeTag.chooseData ); }
    static get constrData() { return new IRNative( IRNativeTag.constrData ); }
    static get mapData() { return new IRNative( IRNativeTag.mapData ); }
    static get listData() { return new IRNative( IRNativeTag.listData ); }
    static get iData() { return new IRNative( IRNativeTag.iData ); }
    static get bData() { return new IRNative( IRNativeTag.bData ); }
    static get unConstrData() { return new IRNative( IRNativeTag.unConstrData ); }
    static get unMapData() { return new IRNative( IRNativeTag.unMapData ); }
    static get unListData() { return new IRNative( IRNativeTag.unListData ); }
    static get unIData() { return new IRNative( IRNativeTag.unIData ); }
    static get unBData() { return new IRNative( IRNativeTag.unBData ); }
    static get equalsData() { return new IRNative( IRNativeTag.equalsData ); }
    static get mkPairData() { return new IRNative( IRNativeTag.mkPairData ); }
    static get mkNilData() { return new IRNative( IRNativeTag.mkNilData ); }
    static get mkNilPairData() { return new IRNative( IRNativeTag.mkNilPairData ); }
    static get serialiseData() { return new IRNative( IRNativeTag.serialiseData ); }
    static get verifyEcdsaSecp256k1Signature() { return new IRNative( IRNativeTag.verifyEcdsaSecp256k1Signature ); }
    static get verifySchnorrSecp256k1Signature() { return new IRNative( IRNativeTag.verifySchnorrSecp256k1Signature ); }
    static get bls12_381_G1_add() { return new IRNative( IRNativeTag.bls12_381_G1_add ); }
    static get bls12_381_G1_neg() { return new IRNative( IRNativeTag.bls12_381_G1_neg ); }
    static get bls12_381_G1_scalarMul() { return new IRNative( IRNativeTag.bls12_381_G1_scalarMul ); }
    static get bls12_381_G1_equal() { return new IRNative( IRNativeTag.bls12_381_G1_equal ); }
    static get bls12_381_G1_hashToGroup() { return new IRNative( IRNativeTag.bls12_381_G1_hashToGroup ); }
    static get bls12_381_G1_compress() { return new IRNative( IRNativeTag.bls12_381_G1_compress ); }
    static get bls12_381_G1_uncompress() { return new IRNative( IRNativeTag.bls12_381_G1_uncompress ); }
    static get bls12_381_G2_add() { return new IRNative( IRNativeTag.bls12_381_G2_add ); }
    static get bls12_381_G2_neg() { return new IRNative( IRNativeTag.bls12_381_G2_neg ); }
    static get bls12_381_G2_scalarMul() { return new IRNative( IRNativeTag.bls12_381_G2_scalarMul ); }
    static get bls12_381_G2_equal() { return new IRNative( IRNativeTag.bls12_381_G2_equal ); }
    static get bls12_381_G2_hashToGroup() { return new IRNative( IRNativeTag.bls12_381_G2_hashToGroup ); }
    static get bls12_381_G2_compress() { return new IRNative( IRNativeTag.bls12_381_G2_compress ); }
    static get bls12_381_G2_uncompress() { return new IRNative( IRNativeTag.bls12_381_G2_uncompress ); }
    static get bls12_381_millerLoop() { return new IRNative( IRNativeTag.bls12_381_millerLoop ); }
    static get bls12_381_mulMlResult() { return new IRNative( IRNativeTag.bls12_381_mulMlResult ); }
    static get bls12_381_finalVerify() { return new IRNative( IRNativeTag.bls12_381_finalVerify ); }
    static get keccak_256() { return new IRNative( IRNativeTag.keccak_256 ); }
    static get blake2b_224() { return new IRNative( IRNativeTag.blake2b_224 ); }
    static get integerToByteString() { return new IRNative( IRNativeTag.integerToByteString ); }
    static get byteStringToInteger() { return new IRNative( IRNativeTag.byteStringToInteger ); }

    static get z_comb() { return new IRNative( IRNativeTag.z_comb ); }
    static get _matchList() { return new IRNative( IRNativeTag._matchList ); }
    static get _recursiveList() { return new IRNative( IRNativeTag._recursiveList ); }
    static get _dropList() { return new IRNative( IRNativeTag._dropList ); }
    static get _indexList() { return new IRNative( IRNativeTag._indexList ); }
    static get _foldr() { return new IRNative( IRNativeTag._foldr ); }
    static get _foldl() { return new IRNative( IRNativeTag._foldl ); }
    static get _mkFindData() { return new IRNative( IRNativeTag._mkFindData ); }
    static get _length() { return new IRNative( IRNativeTag._length ); }
    static get _some() { return new IRNative( IRNativeTag._some ); }
    static get _every() { return new IRNative( IRNativeTag._every ); }
    static get _mkFilter() { return new IRNative( IRNativeTag._mkFilter ); }
    // static get _fstPair() { return new IRNative( IRNativeTag._fstPair ); }
    // static get _sndPair() { return new IRNative( IRNativeTag._sndPair ); }
    static get _id() { return new IRNative( IRNativeTag._id ); }
    static get _not() { return new IRNative( IRNativeTag._not ); }
    static get _strictAnd() { return new IRNative( IRNativeTag._strictAnd ); }
    static get _and() { return new IRNative( IRNativeTag._and ); }
    static get _strictOr() { return new IRNative( IRNativeTag._strictOr ); }
    static get _or() { return new IRNative( IRNativeTag._or ); }
    static get _gtBS() { return new IRNative( IRNativeTag._gtBS ); }
    static get _gtEqBS() { return new IRNative( IRNativeTag._gtEqBS ); }
    static get _gtInt() { return new IRNative( IRNativeTag._gtInt ); }
    static get _gtEqInt() { return new IRNative( IRNativeTag._gtEqInt ); }
    static get _strToData() { return new IRNative( IRNativeTag._strToData ); }
    static get _pairDataToData() { return new IRNative( IRNativeTag._pairDataToData ); }
    static get _strFromData() { return new IRNative( IRNativeTag._strFromData ); }
    static get _pairDataFromData() { return new IRNative( IRNativeTag._pairDataFromData ); }
    static get _lazyChooseList() { return new IRNative( IRNativeTag._lazyChooseList ); }
    static get _lazyIfThenElse() { return new IRNative( IRNativeTag._lazyIfThenElse ); }
}