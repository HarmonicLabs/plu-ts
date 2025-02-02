import { hasSourceRange, HasSourceRange } from "../nodes/HasSourceRange";
import { Source } from "./Source";

export class SourceRange
{
    readonly source: Source;

    start: number;
    end: number;

    constructor(
        source: Source,
        start: number, 
        end: number
    )
    {
        if(!Number.isSafeInteger( start )) throw new Error("start is not a safe integer");
        this.start = start;
        this.end = end;
        this.source = source;
    }

    clone(): SourceRange
    {
        return new SourceRange(this.source, this.start, this.end);
    }

    static join(
        a: SourceRange | HasSourceRange,
        b: SourceRange | HasSourceRange
    ): SourceRange
    {
        a = hasSourceRange(a) ? a.range : a;
        b = hasSourceRange(b) ? b.range : b;
        if(!( a instanceof SourceRange )) throw new Error("a is not a SourceRange");
        if(!( b instanceof SourceRange )) throw new Error("b is not a SourceRange");

        if (a.source !== b.source) throw new Error("source mismatch");
        
        let range = new SourceRange(
            a.source,
            a.start < b.start ? a.start : b.start,
            a.end > b.end ? a.end : b.end
        );
        return range;
    }

    equals(other: SourceRange): boolean
    {
        return (
            this.source === other.source ||
            (
                this.start === other?.start &&
                this.end === other?.end
            )
        );
    }

    atStart(): SourceRange
    {
        return new SourceRange(this.source, this.start, this.start);
    }

    atEnd(): SourceRange
    {
        return new SourceRange(this.source, this.end, this.end);
    }

    toString(): string
    {
        return this.source.text.substring(this.start, this.end);
    }
}