import { Source } from "../ast/Source/Source";
import { SourceRange } from "../ast/Source/SourceRange";
import { assert } from "../utils/assert";
import { DiagnosticCode, DiagnosticCategory } from "./DiagnosticCategory";
import { DiagnosticMessage } from "./DiagnosticMessage";
import { HasOwnToString } from "./utils/types";

/** Base class of all diagnostic emitters. */
export abstract class DiagnosticEmitter {

    /** Diagnostic messages emitted so far. */
    diagnostics: DiagnosticMessage[];
    /** Diagnostic messages already seen, by range. */
    private seen: Map<Source, Map<number, DiagnosticMessage[]>> = new Map();

    /** Initializes this diagnostic emitter. */
    protected constructor(diagnostics: DiagnosticMessage[] | undefined = undefined) {
        if (!Array.isArray(diagnostics)) diagnostics = [];
        this.diagnostics = diagnostics;
    }

    emitDiagnosticMessage(message: DiagnosticMessage): void
    {
        this.diagnostics.push( message );
    }

    /** Emits a diagnostic message of the specified category. */
    emitDiagnostic<A,B,C>(
        code: DiagnosticCode,
        category: DiagnosticCategory,
        range: SourceRange | undefined,
        relatedRange: SourceRange | undefined,
        arg0: string | HasOwnToString<A> | undefined = undefined,
        arg1: string | HasOwnToString<B> | undefined = undefined,
        arg2: string | HasOwnToString<C> | undefined = undefined
    ): void
    {
        const originalStackLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 6;
        let emitStack = new Error().stack;
        Error.stackTraceLimit = originalStackLimit;

        emitStack = emitStack?.split("\n").slice(2).map( l => l.trim() ).join("\n");

        let message = DiagnosticMessage.create(code, category, arg0, arg1, arg2, emitStack);
        if (range) message = message.withRange(range);
        if (relatedRange) message.relatedRange = relatedRange;
        // It is possible that the same diagnostic is emitted twice, for example
        // when compiling generics with different types or when recompiling a loop
        // because our initial assumptions didn't hold. It is even possible to get
        // multiple instances of the same range during parsing. Deduplicate these.
        if (range) {
            let seen = this.seen;
            if (seen.has(range.source)) {
                let seenInSource = assert(seen.get(range.source));
                if (seenInSource.has(range.start)) {
                    let seenMessagesAtPos = assert(seenInSource.get(range.start));
                    for (let i = 0, k = seenMessagesAtPos.length; i < k; ++i) {
                        if (seenMessagesAtPos[i].equals(message)) return;
                    }
                    seenMessagesAtPos.push(message);
                } else {
                    seenInSource.set(range.start, [message]);
                }
            } else {
                let seenInSource = new Map<number, DiagnosticMessage[]>();
                seenInSource.set(range.start, [message]);
                seen.set(range.source, seenInSource);
            }
        }
        this.emitDiagnosticMessage(message);
        // console.log(formatDiagnosticMessage(message, true, true) + "\n"); // temporary
        // console.log(<string>new Error("stack").stack);
    }

    /** Emits an overly pedantic diagnostic message. */
    pedantic(
        code: DiagnosticCode,
        range: SourceRange | undefined,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Pedantic, range, undefined, arg0, arg1, arg2);
    }

    /** Emits an overly pedantic diagnostic message with a related range. */
    pedanticRelated(
        code: DiagnosticCode,
        range: SourceRange,
        relatedRange: SourceRange,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Pedantic, range, relatedRange, arg0, arg1, arg2);
    }

    /** Emits an informatory diagnostic message. */
    info(
        code: DiagnosticCode,
        range: SourceRange | undefined,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Info, range, undefined, arg0, arg1, arg2);
    }

    /** Emits an informatory diagnostic message with a related range. */
    infoRelated(
        code: DiagnosticCode,
        range: SourceRange,
        relatedRange: SourceRange,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Info, range, relatedRange, arg0, arg1, arg2);
    }

    /** Emits a warning diagnostic message. */
    warning(
        code: DiagnosticCode,
        range: SourceRange | undefined,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): undefined {
        this.emitDiagnostic(code, DiagnosticCategory.Warning, range, undefined, arg0, arg1, arg2);
        return undefined;
    }

    /** Emits a warning diagnostic message with a related range. */
    warningRelated(
        code: DiagnosticCode,
        range: SourceRange,
        relatedRange: SourceRange,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Warning, range, relatedRange, arg0, arg1, arg2);
    }

    /** Emits an error diagnostic message. */
    error<A,B,C>(
        code: DiagnosticCode,
        range: SourceRange | undefined,
        arg0: string | HasOwnToString<A> | undefined = undefined,
        arg1: string | HasOwnToString<B> | undefined = undefined,
        arg2: string | HasOwnToString<C> | undefined = undefined
    ): undefined
    {
        this.emitDiagnostic(code, DiagnosticCategory.Error, range, undefined, arg0, arg1, arg2);
        return undefined;
    }

    /** Emits an error diagnostic message with a related range. */
    errorRelated(
        code: DiagnosticCode,
        range: SourceRange,
        relatedRange: SourceRange,
        arg0: string | undefined = undefined,
        arg1: string | undefined = undefined,
        arg2: string | undefined = undefined
    ): void {
        this.emitDiagnostic(code, DiagnosticCategory.Error, range, relatedRange, arg0, arg1, arg2);
    }
}