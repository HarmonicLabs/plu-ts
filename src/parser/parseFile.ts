import type { Source } from "../ast/Source/Source";
import { defaultSymbolForge } from "../compiler/internalVar";
import { Parser } from "./Parser";

export function parseFile(
    path: string,
    src: string,
    getUid: () => string = defaultSymbolForge.getUid.bind( defaultSymbolForge ),
    isEntry: boolean = false
)
{
    return Parser.parseFile( path, src, getUid, isEntry );
}

export function parseSource( src: Source )
{
    return Parser.parseSource( src );
}