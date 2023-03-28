import { blake2b_128 } from "../../../../crypto";
import { IllegalIRToUPLC } from "../../../../errors/PlutsIRError/IRCompilationError/IllegalIRToUPLC";
import { UnexpectedMarkHashInvalidCall } from "../../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { Cloneable } from "../../../../types/interfaces/Cloneable";
import UPLCFlatUtils from "../../../../utils/UPLCFlatUtils";
import { ToJson } from "../../../../utils/ts/ToJson";
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { ToUPLC } from "../../../UPLC/interfaces/ToUPLC";
import { IRTerm } from "../../IRTerm";
import { IHash } from "../../interfaces/IHash";
import { IIRParent } from "../../interfaces/IIRParent";
import { concatUint8Arr } from "../../utils/concatUint8Arr";
import { isIRTerm } from "../../utils/isIRTerm";
import { positiveBigIntAsBytes } from "../../utils/positiveIntAsBytes";
import { IRNativeTag, nativeTagToString } from "./IRNativeTag";

/**
 * we might not need all the hashes
 * 
 * but one we get one for a specific tag is not worth it re calclualte it
 */
const nativeHashesCache: { [n: number/*IRNativeTag*/]: Uint8Array } = {} as any;

/**
 * `IRNative` ⊇ `Builtins` + `std::fn`
**/
export class IRNative
    implements Cloneable<IRNative>, IHash, IIRParent, ToJson
{
    readonly tag!: IRNativeTag;
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    parent: IRTerm | undefined;

    constructor( tag: IRNativeTag )
    {
        Object.defineProperty(
            this, "tag", {
                value: tag,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(nativeHashesCache[this.tag] === undefined)
                    {
                        nativeHashesCache[this.tag] = blake2b_128( 
                            concatUint8Arr( 
                                IRNative.tag, 
                                positiveBigIntAsBytes(
                                    BigInt(
                                        "0b" + 
                                        UPLCFlatUtils.zigzagBigint(
                                            BigInt( this.tag )
                                        )
                                        // builtin tag takes 7 bits
                                        // zigzagged it becomes up to 8
                                        .toString(2).padStart( 8, '0' )
                                    )
                                )
                            )
                        );
                    }
                    // return a copy
                    return nativeHashesCache[this.tag].slice()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { throw new UnexpectedMarkHashInvalidCall("IRNative") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
        
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0100 ]); }

    clone(): IRNative
    {
        return new IRNative( this.tag );
    }

    toJson()
    {
        return {
            type: "IRNative",
            native: nativeTagToString( this.tag )
        };
    }

    static get addInteger() { return new IRNative( IRNativeTag.addInteger ) }
    static get subtractInteger() { return new IRNative( IRNativeTag.subtractInteger ) }
    static get multiplyInteger() { return new IRNative( IRNativeTag.multiplyInteger ) }
    static get divideInteger() { return new IRNative( IRNativeTag.divideInteger ) }
    static get quotientInteger() { return new IRNative( IRNativeTag.quotientInteger ) }
    static get remainderInteger() { return new IRNative( IRNativeTag.remainderInteger ) }
    static get modInteger() { return new IRNative( IRNativeTag.modInteger ) }
    static get equalsInteger() { return new IRNative( IRNativeTag.equalsInteger ) }
    static get lessThanInteger() { return new IRNative( IRNativeTag.lessThanInteger ) }
    static get lessThanEqualInteger() { return new IRNative( IRNativeTag.lessThanEqualInteger ) }
    static get appendByteString() { return new IRNative( IRNativeTag.appendByteString ) }
    static get consByteString() { return new IRNative( IRNativeTag.consByteString ) }
    static get sliceByteString() { return new IRNative( IRNativeTag.sliceByteString ) }
    static get lengthOfByteString() { return new IRNative( IRNativeTag.lengthOfByteString ) }
    static get indexByteString() { return new IRNative( IRNativeTag.indexByteString ) }
    static get equalsByteString() { return new IRNative( IRNativeTag.equalsByteString ) }
    static get lessThanByteString() { return new IRNative( IRNativeTag.lessThanByteString ) }
    static get lessThanEqualsByteString() { return new IRNative( IRNativeTag.lessThanEqualsByteString ) }
    static get sha2_256() { return new IRNative( IRNativeTag.sha2_256 ) }
    static get sha3_256() { return new IRNative( IRNativeTag.sha3_256 ) }
    static get blake2b_256() { return new IRNative( IRNativeTag.blake2b_256 ) }
    static get verifyEd25519Signature() { return new IRNative( IRNativeTag.verifyEd25519Signature ) }
    static get appendString() { return new IRNative( IRNativeTag.appendString ) }
    static get equalsString() { return new IRNative( IRNativeTag.equalsString ) }
    static get encodeUtf8() { return new IRNative( IRNativeTag.encodeUtf8 ) }
    static get decodeUtf8() { return new IRNative( IRNativeTag.decodeUtf8 ) }
    static get strictIfThenElse() { return new IRNative( IRNativeTag.strictIfThenElse ) }
    static get chooseUnit() { return new IRNative( IRNativeTag.chooseUnit ) }
    static get trace() { return new IRNative( IRNativeTag.trace ) }
    static get fstPair() { return new IRNative( IRNativeTag.fstPair ) }
    static get sndPair() { return new IRNative( IRNativeTag.sndPair ) }
    static get strictChooseList() { return new IRNative( IRNativeTag.strictChooseList ) }
    static get mkCons() { return new IRNative( IRNativeTag.mkCons ) }
    static get headList() { return new IRNative( IRNativeTag.headList ) }
    static get tailList() { return new IRNative( IRNativeTag.tailList ) }
    static get nullList() { return new IRNative( IRNativeTag.nullList ) }
    static get chooseData() { return new IRNative( IRNativeTag.chooseData ) }
    static get constrData() { return new IRNative( IRNativeTag.constrData ) }
    static get mapData() { return new IRNative( IRNativeTag.mapData ) }
    static get listData() { return new IRNative( IRNativeTag.listData ) }
    static get iData() { return new IRNative( IRNativeTag.iData ) }
    static get bData() { return new IRNative( IRNativeTag.bData ) }
    static get unConstrData() { return new IRNative( IRNativeTag.unConstrData ) }
    static get unMapData() { return new IRNative( IRNativeTag.unMapData ) }
    static get unListData() { return new IRNative( IRNativeTag.unListData ) }
    static get unIData() { return new IRNative( IRNativeTag.unIData ) }
    static get unBData() { return new IRNative( IRNativeTag.unBData ) }
    static get equalsData() { return new IRNative( IRNativeTag.equalsData ) }
    static get mkPairData() { return new IRNative( IRNativeTag.mkPairData ) }
    static get mkNilData() { return new IRNative( IRNativeTag.mkNilData ) }
    static get mkNilPairData() { return new IRNative( IRNativeTag.mkNilPairData ) }
    static get serialiseData() { return new IRNative( IRNativeTag.serialiseData ) }
    static get verifyEcdsaSecp256k1Signature() { return new IRNative( IRNativeTag.verifyEcdsaSecp256k1Signature ) }
    static get verifySchnorrSecp256k1Signature() { return new IRNative( IRNativeTag.verifySchnorrSecp256k1Signature ) }
    static get z_comb() { return new IRNative( IRNativeTag.z_comb ) }
    static get _matchList() { return new IRNative( IRNativeTag._matchList ) }
    static get _recursiveList() { return new IRNative( IRNativeTag._recursiveList ) }
    static get _dropList() { return new IRNative( IRNativeTag._dropList ) }
    static get _indexList() { return new IRNative( IRNativeTag._indexList ) }
    static get _foldr() { return new IRNative( IRNativeTag._foldr ) }
    static get _foldl() { return new IRNative( IRNativeTag._foldl ) }
    static get _mkFind() { return new IRNative( IRNativeTag._mkFind ) }
    static get _length() { return new IRNative( IRNativeTag._length ) }
    static get _some() { return new IRNative( IRNativeTag._some ) }
    static get _every() { return new IRNative( IRNativeTag._every ) }
    static get _mkFilter() { return new IRNative( IRNativeTag._mkFilter ) }
    // static get _fstPair() { return new IRNative( IRNativeTag._fstPair ) }
    // static get _sndPair() { return new IRNative( IRNativeTag._sndPair ) }
    static get _id() { return new IRNative( IRNativeTag._id ) }
    static get _not() { return new IRNative( IRNativeTag._not ) }
    static get _strictAnd() { return new IRNative( IRNativeTag._strictAnd ) }
    static get _and() { return new IRNative( IRNativeTag._and ) }
    static get _strictOr() { return new IRNative( IRNativeTag._strictOr ) }
    static get _or() { return new IRNative( IRNativeTag._or ) }
    static get _gtBS() { return new IRNative( IRNativeTag._gtBS ) }
    static get _gtEqBS() { return new IRNative( IRNativeTag._gtEqBS ) }
    static get _gtInt() { return new IRNative( IRNativeTag._gtInt ) }
    static get _gtEqInt() { return new IRNative( IRNativeTag._gtEqInt ) }
    static get _strToData() { return new IRNative( IRNativeTag._strToData ) }
    static get _pairDataToData() { return new IRNative( IRNativeTag._pairDataToData ) }
    static get _strFromData() { return new IRNative( IRNativeTag._strFromData ) }
    static get _pairDataFromData() { return new IRNative( IRNativeTag._pairDataFromData ) }
    static get _lazyChooseList() { return new IRNative( IRNativeTag._lazyChooseList ) }
    static get _lazyIfThenElse() { return new IRNative( IRNativeTag._lazyIfThenElse ) }

}