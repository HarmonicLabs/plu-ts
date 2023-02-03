import type { uint5 } from "../types";

export function rotr32( x: number, by: uint5 ): number
{
    return ( x >>> by ) | ( x << (32 - by)) | 0;
}