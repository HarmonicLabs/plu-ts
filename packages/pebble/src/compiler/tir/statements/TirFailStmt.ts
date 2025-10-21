import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";

export class TirFailStmt
    implements ITirStmt
{
    constructor(
        /** must be string (or utf8 bytes) */
        public failMsgExpr: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return `fail${ this.failMsgExpr ? ` ${this.failMsgExpr.toString()}` : "" }`;
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        return `${indent_base}fail${ this.failMsgExpr ? ` ${this.failMsgExpr.pretty( indent )}` : "" }`;
    }

    definitelyTerminates(): boolean { return true; }

    deps(): string[]
    {
        return this.failMsgExpr?.deps() ?? []
    }
}