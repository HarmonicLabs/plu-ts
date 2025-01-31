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

    static join(a: SourceRange, b: SourceRange): SourceRange {
        if (a.source != b.source) throw new Error("source mismatch");
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