import type { Source } from "../ast/Source/Source";
import { Parser } from "./Parser";

export function parseFile(
    path: string,
    src: string,
    isEntry: boolean = false
)
{
    return Parser.parseFile( path, src, isEntry );
}

export function parseSource( src: Source )
{
    return Parser.parseSource( src );
}