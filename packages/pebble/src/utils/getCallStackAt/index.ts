/**
 * `Error#captureStackTrace` is not standard;
 * 
 * `Error#captureStackTrace` is only available in V8-based JavaScript environments like Node.js and Chrome.
 * https://nodejs.org/api/errors.html#errorcapturestacktracetargetobject-constructoropt
 * 
 * in theory more efficient than creating a whole `new Error()` and then getting the 'stack` property.
**/
const hasV8Suff = typeof Error.captureStackTrace === "function" && typeof Error.prepareStackTrace === "function";

export type CallStackSiteInfos = {
    /** raw call stack line as it is reported in `new Error().stack */
    __line__: string,
    inferredName?: string | undefined,
    path: string,
    line: number | undefined,
    column: number | undefined,
    once: (evt: "inferredName", listener: ( inferredName: string ) => any ) => void
    dispatchEvent: ( evt: "inferredName", inferredName: string ) => void
}

export interface GetCallStackAtOptions {
    /**
     * if `inferredName` was not already present in the stack trace
     * tries to parse the file (using `fetch`) indicated by the stack trace
     * 
     * **if found**, `inferredName` will be modified i the reference present in the object returned
     * 
     * @default false
    **/
    tryGetNameAsync?: boolean
    /**
     * automatically add callback once the name is inferred
    **/
    onNameInferred?: ( inferredName: string ) => void
}

export const defaultGetCallStackAtOptions: GetCallStackAtOptions = Object.freeze({
    tryGetNameAsync: false
} as GetCallStackAtOptions);

/**
 * 
 * @param n index of an array tha looks like this
 * ```ts
 *          [
 *              "Error: ",
 *              "    at getCallStackAt path/to/this/file.ts 10:17",
 *              "    at someCallerFunction path/to/caller/file.ts line:column",
 *              "    at callerCallerFunction path/to/callerCaller/file.ts line:column",
 *              "    at just/some/path/to/some/caller.ts line:column",
 *              "    at someOtherFunction path/to/something.ts line:column",
 *              ...rest_of_call_stack
 *          ]
 * ```
 * @returns 
 */
export function getCallStackAt(
    n: number = 3,
    opts: GetCallStackAtOptions = defaultGetCallStackAtOptions
): CallStackSiteInfos | undefined
{
    const originalStackTraceLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = n;

    let stackTrace: string | undefined = undefined;
    // `new Error().stack` still not standard in theory but widely supported
    // (97% of browsers at time of writing)
    // https://caniuse.com/?search=Error%3A%20stack
    stackTrace = new Error().stack;
    stackTrace = stackTrace?.split(/\r?\n/)[n];

    Error.stackTraceLimit = originalStackTraceLimit;

    if( typeof stackTrace !== "string" )
    {
        return undefined;
    }

    const [ _at, name_or_path, maybe_path ] = stackTrace.split(" ").filter( str => str !== "" );

    const isPathThird = canBeStackTracePath( maybe_path );
    let inferredName: string | undefined = undefined

    let rawPath = (isPathThird ? maybe_path as string : name_or_path).trim();
    if( rawPath.startsWith ("(") ) rawPath = rawPath.slice(1).trimStart();
    if( rawPath.endsWith (")") ) rawPath = rawPath.slice(0, rawPath.length - 1 ).trimEnd();

    const chunks = rawPath.split(":");

    const column = tryGetSafeInt( chunks[ chunks.length - 1 ] );
    const line = tryGetSafeInt( chunks[ chunks.length - 2 ] );
    // if, for any reason, the path includes ":"
    const path = chunks.length === 3 ? chunks[0] : chunks.slice( 0, chunks.length - 2 ).join(":");

    const inferredCallbacks: (( inferred: string ) => any)[] = [];

    if( typeof opts.onNameInferred === "function" )
    {
        inferredCallbacks.push( opts.onNameInferred );
    }

    const result: CallStackSiteInfos = {
        __line__: stackTrace,
        inferredName,
        path,
        column,
        line,
        once(evt: "inferredName", listener: ( inferredName: string ) => any ): void
        {
            if( evt === "inferredName" && typeof listener === "function" )
            {
                if( typeof result.inferredName === "string" ) listener( result.inferredName );
                else inferredCallbacks.push( listener );
            }
        },
        dispatchEvent( evt: "inferredName", inferredName: string ): void
        {
            if( evt === "inferredName" && typeof inferredName === "string" )
            {
                let cb: (inferred: string) => any;
                while( cb = inferredCallbacks.shift()! )
                {
                    cb( inferredName )
                }
            }
        }
    }

    // if( isPathThird && !name_or_path.includes("anonymous") ) inferredName = name_or_path
    if( opts.tryGetNameAsync === true )
    {
        // tries synchronously, fallbacks to async
        tryGetName( result );
    }
    
    return result;
}

function canBeStackTracePath( thing: string | undefined ): boolean
{
    if( typeof thing !== "string" ) return false;
    return thing.split(":").length === 3;
}

function tryGetSafeInt( stuff: any ): number | undefined
{
    try {
        const n = parseInt( stuff );
        if( Number.isSafeInteger( n ) ) return n;
        return undefined;
    } catch {
        return undefined;
    }
}

const _MAX_CACHE_SIZE = 10;
const _cachedFiles: string[] = [];
function swapWithPrecedent( path: string )
{
    const idx = _cachedFiles.indexOf( path );
    // already first or not present
    if( idx <= 0 ) return;

    const tmp = _cachedFiles[idx];
    _cachedFiles[idx] = _cachedFiles[idx - 1];
    _cachedFiles[idx - 1] = tmp; 
}
const _files: { [path: string]: string[] } = {};
const cache = {
    has( path: string ): boolean {
        return _cachedFiles.includes( path );
    },
    get( path: string ): string[] | undefined {
        // keep the most recently used on top
        swapWithPrecedent( path );
        return _files[path];
    },
    add( path: string, text: string[] ): void
    {
        if( cache.has( path ) ) return;
        let leastUsedPath: string
        while( _cachedFiles.length >= _MAX_CACHE_SIZE )
        {
            leastUsedPath = _cachedFiles.pop()!;
            delete _files[leastUsedPath];
        }
        _cachedFiles.unshift( path );
        _files[path] = text;
    }
}

const hasGlobalWindow = (function () {
    try {
        const notUndef = typeof window !== "undefined";
        return notUndef;
    } catch { return false; }
})()

/**
 * tries to get synchronously as far as possible
 */
function tryGetName( result: CallStackSiteInfos ): void
{
    // if we don't have a position it makes no sense to get the file
    const { column, line } = result;
    if( typeof column !== "number" || typeof line !== "number" ) return;

    const base = hasGlobalWindow && typeof window?.location?.href === "string" ? window.location.href : ""
    const path = base + result.path;
    
    const file = cache.has( path ) ? cache.get( path ) : tryGetFileSync( path );
    if( !Array.isArray( file ) )
    {
        // necessarily async
        tryGetNameAsync( result );
        // we did all we could; go back;
        // eventually result will be modified asynchronously
        return;
    }
    cache.add( path, file );
    inferNameWithFile( result, file );
}

const isBrowser = (function () {
    try {
        return globalThis === window && !globalThis.process;
    } catch {
        return false;
    }
})();

// let nodeFs: typeof import("fs") | undefined = undefined;
function hasNodeFs(): boolean
{
    return false;
    // return typeof nodeFs === "object" && Object.keys( nodeFs ).length > 0;
}


function tryGetFileSync( path: string ): string[] | undefined
{
    return undefined;
    /*
    if( isBrowser ) return undefined;
    if( !hasNodeFs() ) return undefined;

    if( !nodeFs?.existsSync( path ) ) return undefined;
    const text = nodeFs.readFileSync( path, { encoding: "utf8" });

    return text.split(/\r?\n/);
    //*/
}

/**
 * modifies asynchronously `result.inferredName` if found
 */
function tryGetNameAsync( result: CallStackSiteInfos ): void
{
    let fileText: string = "";
    let path = result.path;

    if( isBrowser )
    {
        // TODO: use fetch
        return undefined;
    }
    else
    {
        /*
        if( typeof nodeFs !== "object" )
        {
            try {
                import("fs").then( mod => {
                    nodeFs = mod;
                    
                    if( !nodeFs?.existsSync( path ) ) return undefined;
                    fileText = nodeFs.readFileSync( path, { encoding: "utf8" });

                    if( fileText === "" ) return;
                    const file = fileText.split(/\r?\n/);

                    cache.add( path, file );
                    inferNameWithFile( result, file );
                });
                return;
            } catch {
                return;
            }
        }
        
        if( !nodeFs?.existsSync( path ) ) return undefined;
        fileText = nodeFs.readFileSync( path, { encoding: "utf8" });
        //*/
        return undefined;
    }

    if( fileText === "" ) return;
    const file = fileText.split(/\r?\n/);

    cache.add( path, file );
    inferNameWithFile( result, file );
}

const singleEqSign = /(?<!=)=(?!>)(?!=)/;
const jsVarNameIsh_g = /\b[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\b/g;

function inferNameWithFile( result: CallStackSiteInfos, file: string[] ): void
{
    const line = result.line;
    if( typeof line !== "number" ) return;
    
    let l = line
    let eq_idx = -1;
    for(; l >= 0; l--)
    {
        eq_idx = file[l].search( singleEqSign );
        if( eq_idx >= 0 ) break;
    }

    // if no equal found just exit
    // (this is the case if we reach the top of the file)
    if( eq_idx < 0 ) return;

    const eq_line_idx = l;

    let var_line: string;
    let decl_idx: number = -1;
    let mathces: RegExpMatchArray | null = null;
    do {
        var_line = file[l--];
        decl_idx = Math.max( var_line.indexOf("const"), var_line.indexOf("let"), var_line.indexOf("var") )
        if( decl_idx < 0 )
        {
            if( l < 0 ) break;
            else continue;
        }
        mathces = var_line.match( jsVarNameIsh_g );
        if( !mathces ) break;
        decl_idx = Math.max( mathces.lastIndexOf("const"), mathces.lastIndexOf("let"), mathces.lastIndexOf("var") );
        if( decl_idx >= mathces.length - 1 ) // last thing matched
        {
            // search in lines below
            l++; // back to this line index (was decremented before)
            let var_idx: number = -1;
            while( l < eq_line_idx )
            {
                var_line = file[l++];
                mathces = var_line.match( jsVarNameIsh_g );
                if( !mathces ) continue;
                result.inferredName = mathces[0];
                result.dispatchEvent("inferredName", result.inferredName);
                break;
            }
            break;
        }
        else
        {
            result.inferredName = mathces[decl_idx + 1];
            result.dispatchEvent("inferredName", result.inferredName);
            break;
        }
    } while( !mathces && l >= 0 )
    if( !mathces ) return;

}