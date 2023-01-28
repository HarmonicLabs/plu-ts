import Cbor from "../../../../cbor/Cbor";
import CborObj from "../../../../cbor/CborObj";
import CborArray from "../../../../cbor/CborObj/CborArray";
import CborString from "../../../../cbor/CborString";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import Cloneable from "../../../../types/interfaces/Cloneable";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Signature from "../../../hashes/Signature/Signature";
import VKey from "./VKey";

export default class VKeyWitness
    implements ToCbor, Cloneable<VKeyWitness>
{
    readonly vkey!: VKey
    readonly signature!: Signature

    constructor( vkey: Hash32, signature: Signature )
    {
        JsRuntime.assert(
            vkey instanceof Hash32,
            "can't construct 'VKeyWitness' without a 'VKey' as first argument"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "vkey",
            vkey
        );

        JsRuntime.assert(
            signature instanceof Signature,
            "can't construct 'VKeyWitness' without a 'Signature' as second argument"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "signature",
            signature
        );
    }

    clone(): VKeyWitness
    {
        return new VKeyWitness(
            new VKey( this.vkey ),
            new Signature( this.signature )
        )
    }
    
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    
    toCborObj(): CborObj
    {
        return new CborArray([
            this.vkey.toCborObj(),
            this.signature.toCborObj()
        ])
    }
}