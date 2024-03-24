import { CborArray, CborObj, CborPositiveRational, CborTag, CborUInt } from "@harmoniclabs/cbor";

export type Rational = CborPositiveRational | number;

export function canBeCborPostiveRational( cbor: CborObj ): cbor is CborPositiveRational | CborTag
{
    return cbor instanceof CborPositiveRational || (
        cbor instanceof CborTag &&
        Number( cbor.tag ) === 30 &&
        cbor.data instanceof CborArray &&
        cbor.data.array.length === 2 &&
        cbor.data.array[0] instanceof CborUInt &&
        cbor.data.array[1] instanceof CborUInt
    );
}

export function isRational( n: any ): n is Rational
{
    return typeof n === "number" || n instanceof CborPositiveRational;
}

export function isRationalOrUndefined( n: any ): n is Rational | undefined
{
    return typeof n == "undefined" || isRational( n );
}

export function cborFromRational( n: Rational ): CborPositiveRational
{
    return n instanceof CborPositiveRational ? n : CborPositiveRational.fromNumber( n );
}

export function tryCborFromRational( n: any ): CborPositiveRational | undefined
{
    return n instanceof CborPositiveRational ? n : (
        typeof n === "number" ? CborPositiveRational.fromNumber( n ) :
        undefined
    );
}

export  function numberFromRational( n: Rational ): number
{
    return n instanceof CborPositiveRational ? n.toNumber() : Number( n );
}
