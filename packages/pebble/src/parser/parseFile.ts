import type { Source } from "../ast/Source/Source";
import { defaultSymbolForge } from "../compiler/internalVar";
import { DiagnosticMessage } from "../diagnostics/DiagnosticMessage";
import { Parser } from "./Parser";

export function parseFilePure(
    path: string,
    src: string,
    getUid: () => string = defaultSymbolForge.getUid.bind( defaultSymbolForge ),
    isEntry: boolean = false
): [ Source, DiagnosticMessage[] ]
{
    return Parser.parseFile( path, src, getUid, isEntry );
}

export function parseFile(
    path: string,
    src: string,
    getUid: () => string = defaultSymbolForge.getUid.bind( defaultSymbolForge ),
    isEntry: boolean = false
): Source
{
    const [ source, diagnostics ] = Parser.parseFile( path, src, getUid, isEntry );
    if( diagnostics.length > 0 )
    {
        throw new Error(
            `Parsing errors:\n${ diagnostics.map( d => d.toString() ).join( "\n" ) }`
        );
    }
    return source;
}

export function parseSource( src: Source )
{
    return Parser.parseSource( src );
}