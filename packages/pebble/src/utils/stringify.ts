import { isObject } from "@harmoniclabs/obj-utils";
import { toHex } from "@harmoniclabs/uint8array-utils";

export function mkReplacer(
    replacer?: (key: string, value: any) => any | null,
    map: WeakMap<any, string> = new WeakMap()
)
{
    if( typeof replacer !== "function" ) replacer = ( k, v ) => v;
    return function( key: string, value: any )
    {
        value = replacer!(key, value);
        if( isObject( value ) )
        {
            if ( map.has(value) ) {
                return { _circular_ref_: map.get(value) };
            }
            map.set(value, key);

            if( typeof value.buffer === "object" && value.buffer instanceof ArrayBuffer )
            {
                value = new Uint8Array(value.buffer);
            }
            if( value instanceof Uint8Array)
            {
                value = toHex(value);
            }
        }
        if( typeof value === "bigint" )
        {
            value = value.toString();
        }

        return value;
    };
}

export function stringify(
    value: any,
    replacer?: (key: string, value: any) => any | null | (number | string)[],
    space: string | number = 0
): string 
{
    if( replacer )
    {
        return JSON.stringify(value, replacer, space);
    }
    return JSON.stringify(value, mkReplacer( replacer, new WeakMap() ), space);
}