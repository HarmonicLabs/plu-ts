import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../IRNodes/IRApp";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { nativeTagToString } from "../IRNodes/IRNative/IRNativeTag";
import { IRTerm } from "../IRTerm";

export function showIR( _ir: IRTerm )
: { 
    text: string, 
    letted: { [hash: string]: string }, 
    hoisted: { [hash: string]: string } 
}
{
    const lettedHashes: Uint8Array[] = [];
    const letted: IRLetted[] = [];

    function addLetted( letted: IRLetted )
    {
        const hash = letted.hash;
        if( !lettedHashes.some( lettedHash => uint8ArrayEq( lettedHash, hash ) ) )
        {
            const deps = letted.dependencies;
            for()
            lettedHashes.push( hash )
        }
    }

    function _internal( ir: IRTerm )
    : { 
        text: string, 
        letted: { [hash: string]: string }, 
        hoisted: { [hash: string]: string } 
    }
    {
        if( ir instanceof IRApp ) return `[ ${_internal(ir.fn).text} ${showIR(ir.arg).text} ]`;
        if( ir instanceof IRNative ) return `(native ${_internal(ir.tag).text})`;
        if( ir instanceof IRLetted )
        {
            if( inlineRepetitiveBodies )
            return `(letted ${showIR()})`
        }
    }

    return _internal( _ir );
}