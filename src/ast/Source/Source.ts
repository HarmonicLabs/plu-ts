import { LIBRARY_PREFIX, PATH_DELIMITER, LIBRARY_SUBST } from "../../../common";
import { CharCode } from "../../../utils/CharCode";
import { mangleInternalPath } from "../../../utils/mangleInternalPath";
import { IAstNode, Statement } from "../../AstNode";
import { AstNodeKind } from "../../AstNodeKind";
import { SourceRange } from "./SourceRange";

/** Indicates the specific kind of a source. */
export enum SourceKind {
    /** User-provided file. */
    User = 0,
    /** User-provided entry file. */
    UserEntry = 1,
    /** Library-provided file. */
    Library = 2,
    /** Library-provided entry file. */
    LibraryEntry = 3
}

Object.freeze(SourceKind);

/** A top-level source node. */
export class Source implements IAstNode {

    /** Gets the special native source. */
    static get native(): Source {
        let source = Source._native;
        if (!source) Source._native = source = new Source(SourceKind.LibraryEntry, LIBRARY_PREFIX + "native.ts", "[native code]");
        return source;
    }
    private static _native: Source | undefined = undefined;

    readonly kind: AstNodeKind = AstNodeKind.Source;
    readonly range: SourceRange;

    sourceKind: SourceKind;
    
    constructor(
        /** Source kind. */
        sourceKind: SourceKind,
        /** Normalized path with file extension. */
        public normalizedPath: string,
        /** Full source text. */
        public text: string
    ) {
        // super(AstNodeKind.Source, new SourceRange(0, text.length));
        Object.defineProperty(this, "sourceKind", { value: sourceKind, writable: false });

        this.kind = AstNodeKind.Source;
        let internalPath = mangleInternalPath(normalizedPath);
        this.internalPath = internalPath;
        let pos = internalPath.lastIndexOf(PATH_DELIMITER);
        this.simplePath = pos >= 0 ? internalPath.substring(pos + 1) : internalPath;
        this.range = new SourceRange(this, 0, text.length);
        this.statements = new Array();
    }

    /** Path used internally. */
    internalPath: string;
    /** Simple path (last part without extension). */
    simplePath: string;
    /** Contained statements. */
    statements: Statement[];
    /** Source map index. */
    debugInfoIndex: number = -1;
    /** Re-exported sources. */
    exportPaths: string[] | undefined = undefined;

    /** Checks if this source represents native code. */
    get isNative(): boolean {
        return this.internalPath === LIBRARY_SUBST;
    }

    /** Checks if this source is part of the (standard) library. */
    get isLibrary(): boolean {
        let kind = this.sourceKind;
        return kind === SourceKind.Library || kind === SourceKind.LibraryEntry;
    }

    /** Cached line starts. */
    private lineCache: number[] | undefined = undefined;

    /** Remembered column number. */
    private lineColumn: number = 1;

    /** Determines the line number at the specified position. Starts at `1`. */
    lineAt(pos: number): number {
        if(pos < 0 || pos >= 0x7fffffff) throw  new Error("pos out of range");
        let lineCache = this.lineCache;
        if (!lineCache) {
            this.lineCache = lineCache = [0];
            let text = this.text;
            let off = 0;
            let end = text.length;
            while (off < end) {
                if (text.charCodeAt(off++) === CharCode.LineFeed) lineCache.push(off);
            }
            lineCache.push(0x7fffffff);
        }
        let l = 0;
        let r = lineCache.length - 1;
        while (l < r) {
            let m = l + ((r - l) >> 1);
            let s = (lineCache[m]);
            if (pos < s) r = m;
            else if (pos < (lineCache[m + 1])) {
                this.lineColumn = pos - s + 1;
                return m + 1;
            }
            else l = m + 1;
        }
        throw new Error("[unreachable] invalid pos");
    }

    /** Gets the column number at the last position queried with `lineAt`. Starts at `1`. */
    columnAt(): number {
        return this.lineColumn;
    }
}
