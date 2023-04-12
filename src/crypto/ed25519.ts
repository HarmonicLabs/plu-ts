import { fromHex, isUint8Array } from "@harmoniclabs/uint8array-utils";
import { sign, getPublicKey, verify, utils } from "@noble/ed25519";
import { byte } from "./types";

type BytesLike = Uint8Array | string | byte[];

function forceUint8Array( stuff: BytesLike ): Uint8Array
{
    if( typeof stuff === "string" ) return fromHex( stuff );
    return isUint8Array( stuff ) ? stuff : new Uint8Array( stuff )
}

/**
 * based on the [`globalThis.crypto`](https://developer.mozilla.org/en-US/docs/Web/API/crypto_property) property
**/
export function genKeys(): { privateKey: Uint8Array, publicKey: Uint8Array }
{
    const privateKey = utils.randomPrivateKey()
    return {
        privateKey,
        publicKey: getPublicKey( privateKey )
    };
}

export function deriveEd25519PublicKey( privateKey: BytesLike ): Uint8Array
{
    return getPublicKey( forceUint8Array( privateKey ) )
}

export function signEd25519( message: BytesLike, privateKey: BytesLike ): [ pubKey: Uint8Array, signature: Uint8Array ]
{
    return [
        deriveEd25519PublicKey( privateKey ),
        sign(
            forceUint8Array( message ),
            forceUint8Array( privateKey )
        )
    ];
}

export function getEd25519Signature( message: BytesLike, privateKey: BytesLike ): Uint8Array
{
    return sign(
        forceUint8Array( message ),
        forceUint8Array( privateKey )
    );
}

export function verifyEd25519Signature( signature: BytesLike, message: BytesLike, publicKey: BytesLike ): boolean
{
    return verify(
        forceUint8Array( signature ),
        forceUint8Array( message ),
        forceUint8Array( publicKey )
    )
}
