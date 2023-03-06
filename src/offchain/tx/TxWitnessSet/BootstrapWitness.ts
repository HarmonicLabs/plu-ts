import BufferUtils from "../../../utils/BufferUtils";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborArray } from "../../../cbor/CborObj/CborArray";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";
import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { ToJson } from "../../../utils/ts/ToJson";
import { Hash32 } from "../../hashes/Hash32/Hash32";
import { Signature } from "../../hashes/Signature";
import { VKey } from "./VKeyWitness/VKey";
import { isUint8Array, toHex } from "../../../uint8Array";

export class BootstrapWitness
    implements ToCbor, Cloneable<BootstrapWitness>, ToJson
{
    readonly pubKey!: VKey;
    readonly signature!: Signature;
    readonly chainCode!: Hash32;
    readonly attributes!: Uint8Array;

    constructor( pubKey: Hash32, signature: Signature, chainCode: Hash32, attributes: Uint8Array )
    {
        JsRuntime.assert(
            pubKey instanceof Hash32,
            "invalid 'pubKey' constructing 'BootstrapWitness'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "pubKey",
            pubKey instanceof VKey ? pubKey : new VKey( pubKey )
        );

        JsRuntime.assert(
            signature instanceof Signature,
            "invalid 'signature' constructing 'BootstrapWitness'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "signature",
            signature
        );

        JsRuntime.assert(
            chainCode instanceof Hash32,
            "invalid 'chainCode' constructing 'BootstrapWitness'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "chainCode",
            chainCode
        );

        JsRuntime.assert(
            isUint8Array( attributes ),
            "invalid 'attributes' constructing 'BootstrapWitness'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "attributes",
            Uint8Array.from( attributes )
        );
    }

    clone(): BootstrapWitness
    {
        return new BootstrapWitness(
            this.pubKey.clone(),
            this.signature.clone(),
            this.chainCode.clone(),
            this.attributes.slice()
        )
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            this.pubKey.toCborObj(),
            this.signature.toCborObj(),
            this.chainCode.toCborObj(),
            new CborBytes( this.attributes )
        ])
    }

    static fromCbor( cStr: CanBeCborString ): BootstrapWitness
    {
        return BootstrapWitness.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): BootstrapWitness
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array[3] instanceof CborBytes
        ))
        throw new InvalidCborFormatError("BootstrapWitness");

        return new BootstrapWitness(
            Hash32.fromCborObj( cObj.array[0] ),
            Signature.fromCborObj( cObj.array[1] ),
            Hash32.fromCborObj( cObj.array[2] ),
            cObj.array[3].buffer
        )
    }

    toJson()
    {
        this.chainCode;

        return {
            pubKey:     this.pubKey   .toString(),
            signature:  this.signature.toString(),
            chainCode:  this.chainCode.toString(),
            attributes: toHex( this.attributes )
        }
    }
}