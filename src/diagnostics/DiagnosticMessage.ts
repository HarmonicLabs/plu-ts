import { SourceRange } from "../ast/Source/SourceRange";
import { assert } from "../utils/assert";
import { CharCode } from "../utils/CharCode";
import { setColorsEnabled, isColorsEnabled, COLOR_RESET, COLOR_RED } from "../utils/terminal";
import { isLineBreak, isWhiteSpace } from "../utils/text";
import { DiagnosticCategory, DiagnosticCode, diagnosticCategoryToString, diagnosticCategoryToColor } from "./DiagnosticCategory";
import { diagnosticCodeToString } from "./diagnosticMessages.generated";
import { HasOwnToString } from "./utils/types";

/** Represents a diagnostic message. */
export class DiagnosticMessage {

    /** Message code. */
    code: number;
    /** Message category. */
    category: DiagnosticCategory;
    /** Message text. */
    message: string;
    /** Respective source range, if any. */
    range: SourceRange | undefined = undefined;
    /** Related range, if any. */
    relatedRange: SourceRange | undefined = undefined; // TODO: Make this a related message for chains?

    /** error stack at `emitDiagnostic` (if any) */
    emitStack: string | undefined;

    /** Constructs a new diagnostic message. */
    private constructor(
        code: number,
        category: DiagnosticCategory,
        message: string,
        emitStack: string | undefined = undefined
    ) {
        this.code = code;
        this.category = category;
        this.message = message;
        this.emitStack = emitStack;
    }

    /** Creates a new diagnostic message of the specified category. */
    static create<A, B, C>(
        code: DiagnosticCode,
        category: DiagnosticCategory,
        arg0: string | HasOwnToString<A> | undefined = undefined,
        arg1: string | HasOwnToString<B> | undefined = undefined,
        arg2: string | HasOwnToString<C> | undefined = undefined,
        emitStack: string | undefined = undefined
    ): DiagnosticMessage {
        let message = diagnosticCodeToString(code);

        if( typeof arg0 !== "string" && arg0 !== undefined) arg0 = arg0.toString();
        if( typeof arg1 !== "string" && arg1 !== undefined) arg1 = arg1.toString();
        if( typeof arg2 !== "string" && arg2 !== undefined) arg2 = arg2.toString();

        if( typeof arg0 === "string" ) message = message.replace("{0}", arg0);
        if( typeof arg1 === "string" ) message = message.replace("{1}", arg1);
        if( typeof arg2 === "string" ) message = message.replace("{2}", arg2);
        return new DiagnosticMessage(code, category, message, emitStack);
    }

    /** Tests if this message equals the specified. */
    equals(other: DiagnosticMessage): boolean {
        if (this.code !== other.code) return false;
        let thisSourceRange = this.range;
        let otherSourceRange = other.range;
        if (thisSourceRange) {
            if (!otherSourceRange || !thisSourceRange.equals(otherSourceRange)) return false;
        } else if (otherSourceRange) {
            return false;
        }
        let thisRelatedSourceRange = this.relatedRange;
        let otherRelatedSourceRange = other.relatedRange;
        if (thisRelatedSourceRange) {
            if (!otherRelatedSourceRange || !thisRelatedSourceRange.equals(otherRelatedSourceRange)) return false;
        } else if (otherRelatedSourceRange) {
            return false;
        }
        return this.message === other.message;
    }

    /** Adds a source range to this message. */
    withRange(range: SourceRange): this {
        this.range = range;
        return this;
    }

    /** Adds a related source range to this message. */
    withRelatedSourceRange(range: SourceRange): this {
        this.relatedRange = range;
        return this;
    }

    /** Converts this message to a string. */
    toString(): string {
        let category = diagnosticCategoryToString(this.category);
        let range = this.range;
        let code = this.code;
        let message = this.message;
        if (range) {
            let source = range.source;
            let path = source.normalizedPath;
            let line = source.lineAt(range.start);
            let column = source.columnAt();
            let len = range.end - range.start;
            return `${category} ${code}: "${message}" in ${path}(${line},${column}+${len})`;
        }
        return `${category} ${code}: ${message}`;
    }

    format({
        colors,
        context
    }: DiagnosticMessageFormatOptions): string
    {
        return formatDiagnosticMessage(
            this,
            Boolean(colors ?? false),
            Boolean(context ?? false)
        ); 
    }
}

export interface DiagnosticMessageFormatOptions {
    colors?: boolean;
    context?: boolean;
};

/** a diagnostic message, optionally with terminal colors and source context. */
export function formatDiagnosticMessage(
    message: DiagnosticMessage,
    useColors: boolean = false,
    showContext: boolean = false
): string {
    let wasColorsEnabled = setColorsEnabled(useColors);

    // general information
    let sb: string[] = [];
    if (isColorsEnabled()) sb.push(diagnosticCategoryToColor(message.category));
    sb.push(diagnosticCategoryToString(message.category));
    if (isColorsEnabled()) sb.push(COLOR_RESET);
    sb.push(message.code < 1000 ? " AS" : " TS");
    sb.push(message.code.toString());
    sb.push(": ");
    sb.push(message.message);

    // include range information if available
    let range = message.range;
    if (range) {
        let source = range.source;
        let relatedRange = message.relatedRange;
        let minLine = 0;
        if (relatedRange) {
            // Justify context indentation when multiple ranges are present
            minLine = Math.max(source.lineAt(range.start), relatedRange.source.lineAt(relatedRange.start));
        }

        // include context information if requested
        if (showContext) {
            sb.push("\n");
            sb.push(formatDiagnosticContext(range, minLine));
        } else {
            sb.push("\n in ");
            sb.push(source.normalizedPath);
        }
        sb.push("(");
        sb.push(source.lineAt(range.start).toString());
        sb.push(",");
        sb.push(source.columnAt().toString());
        sb.push(")");

        if (relatedRange) {
            let relatedSource = relatedRange.source;
            if (showContext) {
                sb.push("\n");
                sb.push(formatDiagnosticContext(relatedRange, minLine));
            } else {
                sb.push("\n in ");
                sb.push(relatedSource.normalizedPath);
            }
            sb.push("(");
            sb.push(relatedSource.lineAt(relatedRange.start).toString());
            sb.push(",");
            sb.push(relatedSource.columnAt().toString());
            sb.push(")");
        }
    }
    setColorsEnabled(wasColorsEnabled);
    return sb.join("");
}

/** Formats the diagnostic context for the specified range, optionally with terminal colors. */
function formatDiagnosticContext(range: SourceRange, minLine: number = 0): string {
    let source = range.source;
    let text = source.text;
    let len = text.length;
    let start = range.start;
    let end = start;
    let lineNumber = source.lineAt(start).toString();
    let lineNumberLength = minLine
        ? Math.max(minLine.toString().length, lineNumber.length)
        : lineNumber.length;
    let lineSpace = " ".repeat(lineNumberLength);
    // Find preceeding line break
    while (start > 0 && !isLineBreak(text.charCodeAt(start - 1))) start--;
    // Skip leading whitespace (assume no supplementary whitespaces)
    while (start < len && isWhiteSpace(text.charCodeAt(start))) start++;
    // Find next line break
    while (end < len && !isLineBreak(text.charCodeAt(end))) end++;
    let sb: string[] = [
        lineSpace,
        "  :\n ",
        " ".repeat(lineNumberLength - lineNumber.length),
        lineNumber,
        " │ ",
        // text.substring(start, end).replaceAll("\t", "  "),
        text.substring(start, end).replace(/\t/g, "  "),
        "\n ",
        lineSpace,
        " │ "
    ];
    while (start < range.start) {
        if (text.charCodeAt(start) === CharCode.Tab) {
            sb.push("  ");
            start += 2;
        } else {
            sb.push(" ");
            start++;
        }
    }
    if (isColorsEnabled()) sb.push(COLOR_RED);
    if (range.start === range.end) {
        sb.push("^");
    } else {
        while (start++ < range.end) {
            let cc = text.charCodeAt(start);
            if (cc === CharCode.Tab) {
                sb.push("~~");
            } else if (isLineBreak(cc)) {
                sb.push(start === range.start + 1 ? "^" : "~");
                break;
            } else {
                sb.push("~");
            }
        }
    }
    if (isColorsEnabled()) sb.push(COLOR_RESET);
    sb.push("\n ");
    sb.push(lineSpace);
    sb.push(" └─ in ");
    sb.push(source.normalizedPath);
    return sb.join("");
}

function replaceAll(str: string, search: string, replacement: string): string {
    return str.replace(new RegExp(search, 'g'), replacement);
}