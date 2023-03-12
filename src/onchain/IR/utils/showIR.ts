import { IRApp } from "../IRNodes/IRApp";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { nativeTagToString } from "../IRNodes/IRNative/IRNativeTag";
import { IRTerm } from "../IRTerm";

export function showIR( ir: IRTerm, inlineRepetitiveBodies: boolean = false ): string
{
    if( ir instanceof IRApp ) return `[ ${showIR(ir.fn, inlineRepetitiveBodies)} ${showIR(ir.arg, inlineRepetitiveBodies)} ]`;
    if( ir instanceof IRNative ) return `(native ${nativeTagToString(ir.tag)})`;
    if( ir instanceof IRLetted )
    {
        if( inlineRepetitiveBodies )
        return `(letted ${ir.})`
    }
}