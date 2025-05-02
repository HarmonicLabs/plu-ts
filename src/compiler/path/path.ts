/**
 * @fileoverview Various file path utility.
 * @license Apache-2.0
 */

import {
	CharCode
} from "../../utils/text";

import {
    extension,
	PATH_DELIMITER
} from "../../common";

const separator = CharCode.Slash;

type Path = string;
type InternalPath = string;

function getAbsolutePath( path: string, requestingPath: string ): string | undefined
{
    if( typeof requestingPath !== "string" || requestingPath === "" ) return undefined;
    const internalPath = getInternalPath( path );
    const resolved = resolveProjAbsolutePath( internalPath, requestingPath );
    if( typeof resolved !== "string" ) return undefined;
    return adjustPathEnd( resolved );
}

function getInternalPath( path: string ): InternalPath
{
    return removeSingleDotDirsFromPath( path ).trim();
}

function adjustPathEnd(path: string): string {
    if (path.endsWith("/")) return path + "index" + extension;

    if( !path.endsWith( extension ) ) path = path + extension;
    return path;
}

/** Resolves the specified path relative to the specified origin. */
function resolveProjAbsolutePath( toResolve: string, fromPath: string ): string | undefined
{
    const fromDirname = dirname( fromPath )
    toResolve = removeSingleDotDirsFromPath( toResolve );

    const fromDirs = fromDirname.split( PATH_DELIMITER ).filter( d => d !== "" );
    const toDirs = toResolve.split( PATH_DELIMITER ).filter( d => d !== "" );

    for( let i = 0; i < toDirs.length; i++ )
    {
        const dir = toDirs[i];
        if( dir === ".." )
        {
            fromDirs.pop();
            if( fromDirs.length === 0 )
            {
                if( toDirs.length === 0 ) return undefined;
                if( toDirs[0] === ".." ) return undefined; // out of project root
            }
            toDirs.splice( i--, 1 );
        }
        else if( dir !== "." )
        {
            fromDirs.push( dir );
        }
    }

    let result = removeSingleDotDirsFromPath(
        fromDirs.join( PATH_DELIMITER )
    );
    // result = result === "." || result.endsWith( fromDirname.slice( 0, fromDirname.length - 1 ) ) ?
    //     result + PATH_DELIMITER :
    //     result;
    
    // result = result.startsWith("/") ? result : "/" + result;

    result = result.replace("//", "/");
    if( result.startsWith("./") ) return result.slice(1);
    if( !result.startsWith("/") ) return "/" + result;
    return result;
}

/** Obtains the directory portion of a normalized path. */
function dirname( path: string ): string {
    const wasEndingWithSlash = path.endsWith( PATH_DELIMITER );
    path = removeSingleDotDirsFromPath( path );
    if( !path.endsWith( PATH_DELIMITER ) && wasEndingWithSlash ) path += PATH_DELIMITER;

    let pos = path.length;
    if (pos <= 1) {
        if (pos === 0) return ".";
        if (path.charCodeAt(0) === separator) {
            path = path.endsWith( PATH_DELIMITER ) ? path : path + PATH_DELIMITER;
            return path;
        }
    }

    while (--pos > 0) {
        if (path.charCodeAt(pos) === separator) {
            path = path.substring(0, pos);
            return path.endsWith( PATH_DELIMITER ) ? path : path + PATH_DELIMITER;
        }
    }
    return "./";
}



/**
 * Normalizes the specified path, removing interior placeholders.
 * Expects a posix-compatible relative path (not Windows compatible).
 */
function removeSingleDotDirsFromPath(path: string): string {
    let pos = 0;
    let len = path.length;

    // trim leading './'
    while (pos + 1 < len &&
        path.charCodeAt(pos) === CharCode.Dot &&
        path.charCodeAt(pos + 1) === separator
    ) {
        pos += 2;
    }

    if( pos > 0 || len < path.length ) {
        path = path.substring(pos, len);
        len -= pos;
        pos = 0;
    }

    let atEnd: boolean;
    while (pos + 1 < len) {
        atEnd = false;

        // we are only interested in '/.' sequences ...
        if(!(
            path.charCodeAt(pos) === separator &&
            path.charCodeAt(pos + 1) === CharCode.Dot
        )) {
            ++pos;
            continue;
        }

        // '/.' ( '/' | $ )
        atEnd = pos + 2 === len;
        if (atEnd ||
            pos + 2 < len &&
            path.charCodeAt(pos + 2) === separator
        ) {
            path = atEnd
                ? path.substring(0, pos)
                : path.substring(0, pos) + path.substring(pos + 2);
            len -= 2;
            continue;
        }

        // '/.' ( './' | '.' $ )
        atEnd = pos + 3 === len;
        if (!(
            atEnd && path.charCodeAt(pos + 2) === CharCode.Dot ||
            pos + 3 < len &&
            path.charCodeAt(pos + 2) === CharCode.Dot &&
            path.charCodeAt(pos + 3) === separator
        ))
        {
            ++pos;
            continue;
        }
        // find preceeding '/'
        let ipos = pos;
        while (--ipos >= 0) {
            if( path.charCodeAt(ipos) !== separator ) continue;

            if (pos - ipos !== 3 ||
                path.charCodeAt(ipos + 1) !== CharCode.Dot ||
                path.charCodeAt(ipos + 2) !== CharCode.Dot
            ) { // exclude '..' itself
                path = atEnd
                    ? path.substring(0, ipos)
                    : path.substring(0, ipos) + path.substring(pos + 3);
                len -= pos + 3 - ipos;
                pos = ipos - 1; // incremented again at end of loop
            }
            break;
        }

        // if there's no preceeding '/', trim start if non-empty
        if (ipos < 0 && pos > 0) {
            if (pos !== 2 ||
                path.charCodeAt(0) !== CharCode.Dot ||
                path.charCodeAt(1) !== CharCode.Dot
            ) { // exclude '..' itself
                path = path.substring(pos + 4);
                len = path.length;
                continue;
            }
        }
        pos++;
    }
    // path = path.endsWith( PATH_DELIMITER ) ? path.substring(0, len - 1) : path;
    return len > 0 ? path : ".";
}