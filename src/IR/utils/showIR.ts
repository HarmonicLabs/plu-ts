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
import { termTypeToString } from "../../type_system/utils";
import { showUPLCConstValue } from "@harmoniclabs/uplc";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRCase } from "../IRNodes/IRCase";
import { equalIrHash, IRHash, irHashToHex } from "../IRHash";
import { stringify } from "../../utils/stringify";
import { IRRecursive } from "../IRNodes/IRRecursive";
import { IRSelfCall } from "../IRNodes/IRSelfCall";

const vars = "abcdefghilmopqrstuvzwxyjkABCDEFGHILJMNOPQRSTUVZWXYJK".split('');

function getVarNameForDbn( dbn: number ): string
{
    if( dbn < 0 ) return `(${dbn})`;
    if( dbn < vars.length ) return vars[ dbn ];
    return vars[ Math.floor( dbn / vars.length ) ] + getVarNameForDbn( dbn - vars.length )
}

export function showIRText( _ir: IRTerm ): string
{
    function _loop( ir: IRTerm, dbn: number ): string
    {
        if( ir instanceof IRApp ) return `[${_loop(ir.fn, dbn)} ${_loop(ir.arg, dbn)}]`;
        if( ir instanceof IRCase ) return `(case ${
            _loop(ir.constrTerm, dbn)
        } [${
            Array.from( ir.continuations ).map( f => _loop( f, dbn )).join(" ")
        }])`;
        if( ir instanceof IRConstr ) return `(constr ${ir.index.toString()} [${
            Array.from( ir.fields ).map( f => _loop( f, dbn )).join(" ")
        }])`;
        if( ir instanceof IRNative ) return `(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            // addLetted( ir );
            return lettedToStr(ir);
        }
        if( ir instanceof IRHoisted )
        {
            return hoistedToStr(ir);
        }
        if( ir instanceof IRVar ) return getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRSelfCall ) return "self_" + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return constToString(ir);
        if( ir instanceof IRDelayed ) return `(delay ${_loop( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_loop( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${vars.join(" ")} ${_loop( ir.body, dbn )})`
        }
        if( ir instanceof IRRecursive )
        {
            const varName = "self_" + getVarNameForDbn( dbn++ );
            return `(recursive ${varName} ${_loop( ir.body, dbn )})`;
        }

        return "";
    }

    return _loop( _ir, 0 );
}

export function showIR( _ir: IRTerm )
: { 
    text: string, 
    letted: { [hash: string]: string }, 
    hoisted: { [hash: string]: string } 
}
{
    const hoistedHashes: IRHash[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted )
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => equalIrHash( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash.slice() as IRHash);
            Object.defineProperty(
                hoisted, irHashToHex( hash ), {
                    value: showIRText( h.hoisted ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    const lettedHashes: IRHash[] = [];
    const letted: { [hash: string]: string } = {};

    function addLetted( l: IRLetted )
    {
        const hash = l.hash;
        if( !lettedHashes.some( lettedHash => equalIrHash( lettedHash, hash ) ) )
        {
            const deps = l.dependencies;
            const nDeps = deps.length;
            for(let i = 0; i < nDeps; i++)
            {
                addLetted( deps[i].letted );
            }

            lettedHashes.push( hash.slice() as IRHash );
            
            getHoistedTerms( l.value ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            Object.defineProperty(
                letted, irHashToHex( hash ), {
                    value: showIRText( l.value ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    function _loop( ir: IRTerm, dbn: number ): string
    {
        if( ir instanceof IRApp ) return `[${_loop(ir.fn, dbn)} ${_loop(ir.arg, dbn)}]`;
        if( ir instanceof IRConstr ) return `(constr ${ir.index} ${Array.from( ir.fields ).map( f => _loop( f, dbn )).join(" ")})`;
        if( ir instanceof IRCase ) return `(case ${_loop( ir.constrTerm, dbn ) } ${Array.from( ir.continuations ).map( f => _loop( f, dbn )).join(" ")})`;
        if( ir instanceof IRNative ) return `(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            addLetted( ir );
            return lettedToStr(ir);
        }
        if( ir instanceof IRHoisted )
        {
            addHoisted( ir );
            return hoistedToStr(ir);
        }
        if( ir instanceof IRVar ) return getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRSelfCall ) return "self_" + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return constToString(ir);
        if( ir instanceof IRDelayed ) return `(delay ${_loop( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_loop( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${vars.join(" ")} ${_loop( ir.body, dbn )})`
        }
        if( ir instanceof IRRecursive )
        {
            const varName = "self_" + getVarNameForDbn( dbn++ );
            return `(recursive ${varName} ${_loop( ir.body, dbn )})`;
        }

        return "";
    }

    const text = _loop( _ir, 0 );

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

    function _loop( ir: IRTerm, dbn: number, depth: number ): string
    {
        const indent = `\n${indentStr.repeat( depth )}`;

        if( ir instanceof IRApp ) return `${indent}[${_loop(ir.fn, dbn, depth + 1 )} ${_loop(ir.arg, dbn, depth + 1)}${indent}]`;
        if( ir instanceof IRCase ) return `${indent}(case ${indent}${
            _loop(ir.constrTerm, dbn, depth + 1)
        } ${indent}[${
            Array.from( ir.continuations ).map( f => _loop( f, dbn, depth + 1 )).join(" ")
        }${indent}])`;
        if( ir instanceof IRConstr ) return `${indent}(constr ${ir.index.toString()} ${indent}[${
            Array.from( ir.fields ).map( f => _loop( f, dbn, depth + 1 )).join(" ")
        }${indent}])`;
        if( ir instanceof IRNative ) return `${indent}(native ${nativeTagToString(ir.tag)})`;
        if( ir instanceof IRLetted )
        {
            // addLetted( ir );
            return `${indent}${lettedToStr(ir)}`;
        }
        if( ir instanceof IRHoisted )
        {
            return `${indent}${hoistedToStr(ir)}`;
        }
        if( ir instanceof IRVar ) return indent + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRSelfCall ) return indent + "self_" + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${vars.join(" ")} ${_loop( ir.body, dbn, depth + 1 )}${indent})`
        }
        if( ir instanceof IRRecursive )
        {
            const varName = "self_" + getVarNameForDbn( dbn++ );
            return `${indent}(recursive ${varName} ${_loop( ir.body, dbn, depth + 1 )}${indent})`;
        }

        return "";
    }

    return _loop( _ir, 0, 0 );
}

export type PrettiedIR = {
    text: string,
    letted: { [hash: string ]: string },
    hoisted: { [hash: string ]: string }
}

export function prettyIR( _ir: IRTerm, _indent = 2 ) : PrettiedIR
{
    if( !Number.isSafeInteger( _indent ) || _indent < 1 ) return showIR( _ir );

    const indentStr = " ".repeat(_indent)

    const hoistedHashes: IRHash[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted )
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => equalIrHash( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash.slice() as IRHash );
            const hashStr = irHashToHex( hash );
            Object.defineProperty(
                hoisted,
                hashStr, 
                { value: prettyIRText( h.hoisted, _indent ), writable: true, enumerable: true }
            );
        }
    }

    const lettedHashes: IRHash[] = [];
    const letted: { [hash: string]: string } = {};

    function addLetted( l: IRLetted )
    {
        const hash = l.hash;
        if( !lettedHashes.some( lettedHash => equalIrHash( lettedHash, hash ) ) )
        {
            const deps = l.dependencies;
            const nDeps = deps.length;
            for(let i = 0; i < nDeps; i++)
            {
                addLetted( deps[i].letted );
            }

            lettedHashes.push( hash.slice() as IRHash );
            
            getHoistedTerms( l.value ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            const hashStr = irHashToHex( hash );
            Object.defineProperty(
                letted, hashStr, {
                    value: prettyIRText( l.value, _indent ),
                    writable: true,
                    enumerable: true
                }
            );
        }
    }

    function _loop( ir: IRTerm, dbn: number, depth: number ): string
    {
        const indent = `\n${indentStr.repeat( depth )}`;

        if( ir instanceof IRApp ) return `${indent}[${_loop( ir.fn, dbn, depth + 1 )} ${_loop( ir.arg, dbn, depth + 1 )}${indent}]`;
        if( ir instanceof IRNative ) return `${indent}(native ${nativeTagToString( ir.tag )})`;
        if( ir instanceof IRLetted )
        {
            addLetted( ir );
            return `${indent}${lettedToStr(ir)}`;
        }
        if( ir instanceof IRHoisted )
        {
            addHoisted( ir )
            return `${indent}${hoistedToStr(ir)}`;
        }
        if( ir instanceof IRVar ) return indent + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRSelfCall ) return indent + "self_" + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${vars.join(" ")} ${_loop( ir.body, dbn, depth + 1 )}${indent})`
        }
        if( ir instanceof IRRecursive )
        {
            const varName = "self_" + getVarNameForDbn( dbn++ );
            return `${indent}(recursive ${varName} ${_loop( ir.body, dbn, depth + 1 )}${indent})`;
        }

        return "";
    }

    const text = _loop( _ir, 0, 0 );

    return {
        text,
        letted,
        hoisted
    };
}

export interface PrettyIRJsonStrOpts {
    text: boolean,
    letted: boolean,
    hoisted: boolean,
}

const defaultPrettyIRJsonStrOpts: PrettyIRJsonStrOpts = {
    text: true,
    letted: true,
    hoisted: true
}

export function prettyIRJsonStr( ir: IRTerm, indent = 2, opts: Partial<PrettyIRJsonStrOpts> = {})
{
    const _opts: PrettyIRJsonStrOpts = {
        ...defaultPrettyIRJsonStrOpts,
        ...opts
    };

    const toJson: any = prettyIR( ir, indent );
    if( !_opts.text ) toJson.text = undefined;
    if( !_opts.letted ) toJson.letted = undefined;
    if( !_opts.hoisted ) toJson.hoisted = undefined;

    return stringify(
        toJson,
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

export function hoistedToStr( ir: IRHoisted ): string
{
    return `(hoisted${(ir.meta.name ? " {"+ir.meta.name+"}" : "")} ${irHashToHex( ir.hash )})`;
}

export function lettedToStr( ir: IRLetted ): string
{
    return `(letted${(ir.meta.name ? " {"+ir.meta.name+"}" : "")} ${ir.dbn} ${irHashToHex( ir.hash )})`;
}

export function constToString( ir: IRConst ): string
{
    return `(const ${termTypeToString(ir.type, 2)} ${showUPLCConstValue(ir.value as any)})`;
}

export function prettyIRInline( _ir: IRTerm, _indent = 2 ): string
{
    const indentStr = " ".repeat(_indent);

    function _loop( ir: IRTerm, dbn: number, depth: number ): string
    {
        const indent = `\n${indentStr.repeat( depth )}`;

        if( ir instanceof IRApp ) return `${indent}[${_loop( ir.fn, dbn, depth + 1 )} ${_loop( ir.arg, dbn, depth + 1 )}${indent}]`;
        if( ir instanceof IRNative ) return `${indent}(native ${nativeTagToString( ir.tag )})`;
        if( ir instanceof IRLetted )
        {
            // addLetted( ir );
            return (
                `${indent}(letted${(ir.meta.name ? " {"+ir.meta.name+"}" : "")} ${ir.dbn} ${irHashToHex( ir.hash )}` + 
                `${_loop( ir.value, dbn, depth + 1 )}`+
                `${indent})`
            );
        }
        if( ir instanceof IRHoisted )
        {
            // addHoisted( ir )
            // return `${indent}${hoistedToStr(ir)}`;
            return (
                `${indent}(hoisted${(ir.meta.name ? " {"+ir.meta.name+"}" : "")} ${irHashToHex( ir.hash )}` + 
                `${_loop( ir.hoisted, dbn, depth + 1 )}`+
                `${indent})`
            );
        }
        if( ir instanceof IRVar ) return indent + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRSelfCall ) return indent + "self_" + getVarNameForDbn( dbn - 1 - ir.dbn );
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            let vars: string[] = new Array( ir.arity );
            for( let i  = 0; i < ir.arity; i++)
            {
                vars[i] = getVarNameForDbn( dbn++ );
            }
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${vars.join(" ")} ${_loop( ir.body, dbn, depth + 1 )}${indent})`
        }
        if( ir instanceof IRRecursive )
        {
            const varName = "self_" + getVarNameForDbn( dbn++ );
            return `${indent}(recursive ${varName} ${_loop( ir.body, dbn, depth + 1 )}${indent})`;
        }

        return "";
    }

    const text = _loop( _ir, 0, 0 );

    return text;
}