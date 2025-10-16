import { IRApp } from "../IRNodes/IRApp";
import { IRLetted } from "../IRNodes/IRLetted";
import { nativeTagToString } from "../IRNodes/IRNative/IRNativeTag";
import { IRTerm } from "../IRTerm";
import { IRHoisted, getHoistedTerms } from "../IRNodes/IRHoisted";
import { IRVar } from "../IRNodes/IRVar";
import { IRConst } from "../IRNodes/IRConst";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRError } from "../IRNodes/IRError";
import { IRFunc } from "../IRNodes/IRFunc";
import { showUPLCConstValue } from "@harmoniclabs/uplc";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRCase } from "../IRNodes/IRCase";
import { equalIrHash, IRHash, irHashToHex } from "../IRHash";
import { stringify } from "../../utils/stringify";
import { IRRecursive } from "../IRNodes/IRRecursive";
import { IRSelfCall } from "../IRNodes/IRSelfCall";
import { IRNative } from "../IRNodes/IRNative";

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
        if( ir instanceof IRVar ) return ir.name.description!;
        if( ir instanceof IRSelfCall ) return "self_" + ir.name.description!;
        if( ir instanceof IRConst ) return constToString(ir);
        if( ir instanceof IRDelayed ) return `(delay ${_loop( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_loop( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            const syms: symbol[] = (ir as any).vars;
            const names = syms.map( s => s.description! );
            return `(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${names.join(" ")} ${_loop( ir.body, dbn + names.length )})`
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

export function showIR( _ir: IRTerm ): PrettiedIR
{
    const hoistedHashes: IRHash[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted ): void
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => equalIrHash( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash as IRHash);
            hoisted[ irHashToHex( hash ) ] = prettyIRText( h.hoisted );
        }
    }

    const lettedHashes: IRHash[] = [];
    const letted: { [hash: string]: PrettiedLetted } = {};

    function addLetted( l: IRLetted ): void
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

            lettedHashes.push( hash as IRHash );
            
            getHoistedTerms( l.value ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            letted[ irHashToHex( hash ) ] = showIRText( l.value );
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
        if( ir instanceof IRVar ) return ir.name.description!;
        if( ir instanceof IRSelfCall ) return "self_" + ir.name.description!;
        if( ir instanceof IRConst ) return constToString(ir);
        if( ir instanceof IRDelayed ) return `(delay ${_loop( ir.delayed, dbn )})`;
        if( ir instanceof IRForced ) return `(force ${_loop( ir.forced, dbn )})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            const syms: symbol[] = (ir as any).vars;
            const names = syms.map( s => s.description! );
            return `(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${names.join(" ")} ${_loop( ir.body, dbn + names.length )})`
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

export function prettyIRText( _ir: IRTerm, _indent = 2 ): string
{
    if( !Number.isSafeInteger( _indent ) || _indent < 1 ) return showIR( _ir ).text;

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
        if( ir instanceof IRVar ) return indent + ir.name.description!;
        if( ir instanceof IRSelfCall ) return indent + "self_" + ir.name.description!;
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            const syms: symbol[] = (ir as any).vars;
            const names = syms.map( s => s.description! );
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${names.join(" ")} ${_loop( ir.body, dbn + names.length, depth + 1 )}${indent})`
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

export interface PrettiedIR extends HoistedAndLetted {
    text: string,
}

export type PrettiedLetted = string;
/*{
    dbn: number,
    text: string,
}*/

export interface HoistedAndLetted {
    letted: { [hash: string ]: PrettiedLetted },
    hoisted: { [hash: string ]: string }

}

export function prettyIR( _ir: IRTerm, _indent = 2 ): PrettiedIR
{
    if( !Number.isSafeInteger( _indent ) || _indent < 1 ) return showIR( _ir );

    const indentStr = " ".repeat(_indent)

    const hoistedHashes: IRHash[] = [];
    const hoisted: { [hash: string]: string } = {};

    function addHoisted( h: IRHoisted ): void
    {
        const hash = h.hash;
        if( !hoistedHashes.some( hoistedHash => equalIrHash( hoistedHash, hash ) ) )
        {
            const deps = h.dependencies;
            for(let i = 0; i < deps.length; i++)
            {
                addHoisted( deps[i].hoisted );
            }

            hoistedHashes.push( hash as IRHash );
            hoisted[ irHashToHex( hash ) ] = prettyIRText( h.hoisted, _indent );
        }
    }

    const lettedHashes: IRHash[] = [];
    const letted: { [hash: string]: PrettiedLetted } = {};

    function addLetted( l: IRLetted ): void
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

            lettedHashes.push( hash as IRHash );
            
            getHoistedTerms( l.value ).forEach( ({ hoisted }) => addHoisted( hoisted ) );

            const hashStr = irHashToHex( hash );
            letted[ hashStr ] = prettyIRText( l.value, _indent );
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
        if( ir instanceof IRVar ) return indent + ir.name.description!;
        if( ir instanceof IRSelfCall ) return indent + "self_" + ir.name.description!;
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            const syms: symbol[] = (ir as any).vars;
            const names = syms.map( s => s.description! );
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${names.join(" ")} ${_loop( ir.body, dbn + names.length, depth + 1 )}${indent})`
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

export function prettyIRJsonStr( ir: IRTerm, indent = 2, opts: Partial<PrettyIRJsonStrOpts> = {}): string
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
    return `(letted ${ir.name.description} ${irHashToHex( ir.hash )})`;
}

export function constToString( ir: IRConst ): string
{
    return `(const ${ir.type.toString()} ${showUPLCConstValue(ir.value as any)})`;
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
                `${indent}(letted ${ir.name.description}` + 
                `${indent+indentStr}{` +
                `${_loop( ir.value, dbn, depth + 2 )}`+
                `${indent+indentStr}}` +
                `${indent})`
            );
        }
        if( ir instanceof IRHoisted )
        {
            // addHoisted( ir )
            // return `${indent}${hoistedToStr(ir)}`;
            return (
                `${indent}(hoisted${(ir.meta.name ? " {"+ir.meta.name+"}" : "")} ${irHashToHex( ir.hash )}` + 
                `${indent+indentStr}{` +
                `${_loop( ir.hoisted, dbn, depth + 2 )}`+
                `${indent+indentStr}}` +
                `${indent})`
            );
        }
        if( ir instanceof IRVar ) return indent + ir.name.description!;
        if( ir instanceof IRSelfCall ) return indent + "self_" + ir.name.description!;
        if( ir instanceof IRConst ) return `${indent}${constToString(ir)}`;
        if( ir instanceof IRDelayed ) return `${indent}(delay ${_loop( ir.delayed, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRForced ) return `${indent}(force ${_loop( ir.forced, dbn, depth + 1 )}${indent})`;
        if( ir instanceof IRError ) return "(error)"
        if( ir instanceof IRFunc )
        {
            const syms: symbol[] = (ir as any).vars;
            const names = syms.map( s => s.description! );
            return `${indent}(func ${typeof ir.name === "string" ? "{"+ir.name+"}" : ""} ${names.join(" ")} ${_loop( ir.body, dbn + names.length, depth + 1 )}${indent})`
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

export function unfromatStr( str: string ): string
{
    return str
    .replace("\n", " ")
    .replace( /\s+/g, " " );
}

export function onlyHoistedAndLetted( prettied: PrettiedIR ): HoistedAndLetted
{
    const result: HoistedAndLetted = { letted: {}, hoisted: {} };

    Object.keys( prettied.letted ).forEach( k => {
        const letted = prettied.letted[k];
        result.letted[k] = unfromatStr( letted );
    });
    Object.keys( prettied.hoisted ).forEach( k => {
        result.hoisted[k] = unfromatStr( prettied.hoisted[k] );
    });

    return result;
}