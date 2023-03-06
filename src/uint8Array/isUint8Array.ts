export function isUint8Array( stuff: any ): stuff is Uint8Array
{
    return stuff instanceof Uint8Array;
}