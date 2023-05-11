import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../IRNodes/IRApp";
import { IRLetted, getLettedTerms } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { nativeTagToString } from "../IRNodes/IRNative/IRNativeTag";
import { IRTerm } from "../IRTerm";
import { IRHoisted, getHoistedTerms } from "../IRNodes/IRHoisted";
import { IRVar } from "../IRNodes/IRVar";
import { IRConst } from "../IRNodes/IRConst";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRError } from "../IRNodes/IRError";
import { IRFunc } from "../IRNodes/IRFunc";
import { termTypeToString } from "../../pluts/type_system/utils";
import { showUPLCConstValue } from "@harmoniclabs/uplc";

const vars = "abcdefghilmopqrstuvzwxyjkABCDEFGHILJMNOPQRSTUVZWXYJK".split('');

function getVarNameForDbn( dbn: number ): string
{
    if( dbn < 0 ) return `(${dbn})`;
    if( dbn < vars.length ) return vars[ dbn ];
    return vars[ Math.floor( dbn / vars.length ) ] + getVarNameForDbn( dbn - vars.length )
}

export function showIRText( _ir: IRTerm ): string
{
    function _internal( ir: IRTerm, dbn: number ): string
    {
        if( ir instanceof IRApp ) return `[${_internal(ir.fn, dbn)} ${_internal(ir.arg, dbn)}]`;
        if( ir instanceof IRNative ) return `(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            // addLetted( ir );
            return `(letted ${ir.dbn} ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRHoisted )
        {
            return `(hoisted ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRVar ) return getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `(const ${termTypeToString(ir.type)} ${showUPLCConstValue(ir.value as any)})`;
        if( ir instanceof IRDelayed ) return `(delay ${_internal( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_internal( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `(func ${vars.join(" ")} ${_internal( ir.body, dbn )})`
        }

        return "";
    }

    return _internal( _ir, 0 );
}

export function showIR( _ir: IRTerm )
: { 
    text: string, 
    letted: { [hash: string]: string }, 
    hoisted: { [hash: string]: string } 
}
{
    const hoistedHashes: Uint8Array[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted )
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => uint8ArrayEq( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash.slice() );
            Object.defineProperty(
                hoisted, toHex( hash ), {
                    value: showIRText( h.hoisted ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    const lettedHashes: Uint8Array[] = [];
    const letted: { [hash: string]: string } = {};

    function addLetted( l: IRLetted )
    {
        const hash = l.hash;
        if( !lettedHashes.some( lettedHash => uint8ArrayEq( lettedHash, hash ) ) )
        {
            const deps = l.dependencies;
            const nDeps = deps.length;
            for(let i = 0; i < nDeps; i++)
            {
                addLetted( deps[i].letted );
            }

            lettedHashes.push( hash.slice() );
            
            getHoistedTerms( l.value.clone() ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            Object.defineProperty(
                letted, toHex( hash ), {
                    value: showIRText( l.value ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    function _internal( ir: IRTerm, dbn: number ): string
    {
        if( ir instanceof IRApp ) return `[${_internal(ir.fn, dbn)} ${_internal(ir.arg, dbn)}]`;
        if( ir instanceof IRNative ) return `(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            addLetted( ir );
            return `(letted ${ir.dbn} ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRHoisted )
        {
            addHoisted( ir );
            return `(hoisted ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRVar ) return getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `(const ${termTypeToString(ir.type)} ${showUPLCConstValue(ir.value as any)})`;
        if( ir instanceof IRDelayed ) return `(delay ${_internal( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_internal( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `(func ${vars.join(" ")} ${_internal( ir.body, dbn )})`
        }

        return "";
    }

    const text = _internal( _ir, 0 );

    return {
        text,
        letted,
        hoisted
    }
}

export function prettyIRText( _ir: IRTerm, _indent = 2 )
{
    if( !Number.isSafeInteger( _indent ) || _indent < 1 ) return showIR( _ir );

    const indentStr = " ".repeat(_indent);

    function _internal( ir: IRTerm, dbn: number, depth: number ): string
    {
        const indent = `\n${indentStr.repeat( depth )}`;

        if( ir instanceof IRApp ) return `${indent}[${_internal(ir.fn, dbn, depth + 1 )} ${_internal(ir.arg, dbn, depth + 1)}${indent}]`;
        if( ir instanceof IRNative ) return `${indent}(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            // addLetted( ir );
            return `${indent}(letted ${ir.dbn} ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRHoisted )
        {
            return `${indent}(hoisted ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRVar ) return indent + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `${indent}(const ${termTypeToString(ir.type)} ${showUPLCConstValue(ir.value as any)})`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_internal( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_internal( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `${indent}(func ${vars.join(" ")} ${_internal( ir.body, dbn, depth + 1 )}${indent})`
        }

        return "";
    }

    return _internal( _ir, 0, 0 );
}

export function prettyIR( _ir: IRTerm, _indent = 2 )
: { 
    text: string, 
    letted: { [hash: string]: string }, 
    hoisted: { [hash: string]: string } 
}
{
    if( !Number.isSafeInteger( _indent ) || _indent < 1 ) return showIR( _ir );

    const indentStr = " ".repeat(_indent)

    const hoistedHashes: Uint8Array[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted )
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => uint8ArrayEq( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash.slice() );
            Object.defineProperty(
                hoisted, toHex( hash ), {
                    value: prettyIRText( h.hoisted, _indent ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    const lettedHashes: Uint8Array[] = [];
    const letted: { [hash: string]: string } = {};

    function addLetted( l: IRLetted )
    {
        const hash = l.hash;
        if( !lettedHashes.some( lettedHash => uint8ArrayEq( lettedHash, hash ) ) )
        {
            const deps = l.dependencies;
            const nDeps = deps.length;
            for(let i = 0; i < nDeps; i++)
            {
                addLetted( deps[i].letted );
            }

            lettedHashes.push( hash.slice() );
            
            getHoistedTerms( l.value.clone() ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            Object.defineProperty(
                letted, toHex( hash ), {
                    value: prettyIRText( l.value, _indent ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    function _internal( ir: IRTerm, dbn: number, depth: number ): string
    {
        const indent = `\n${indentStr.repeat( depth )}`;

        if( ir instanceof IRApp ) return `${indent}[${_internal( ir.fn, dbn, depth + 1 )} ${_internal( ir.arg, dbn, depth + 1 )}${indent}]`;
        if( ir instanceof IRNative ) return `${indent}(native ${nativeTagToString( ir.tag )})`;
        if( ir instanceof IRLetted )
        {
            addLetted( ir );
            return `${indent}(letted ${ir.dbn} ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRHoisted )
        {
            addHoisted( ir );
            return `${indent}(hoisted ${toHex( ir.hash )})`;
        }
        if( ir instanceof IRVar ) return indent + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `${indent}(const ${termTypeToString(ir.type)} ${showUPLCConstValue(ir.value as any)})`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_internal( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_internal( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `${indent}(func ${vars.join(" ")} ${_internal( ir.body, dbn, depth + 1 )}${indent})`
        }

        return "";
    }

    const text = _internal( _ir, 0, 0 );

    return {
        text,
        letted,
        hoisted
    }
}

export function prettyIRJsonStr( ir: IRTerm, indent = 2 )
{
    return JSON.stringify(
        prettyIR( ir, indent ),
        ( k, v ) => {

            if( (k === "text" || (typeof k === "string" && k.length === 32)) && typeof v === "string")
            {
                return v.split("\n");
            }
            return v;
        },
        indent
    );
}