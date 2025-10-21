import { SourceRange } from "../../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";
import { ITirStmt, Termination } from "../TirStmt";
import { TirVarDecl } from "./TirVarDecl";

export class TirArrayLikeDeconstr
    implements ITirStmt
{
    constructor(
        readonly elements: TirVarDecl[],
        readonly rest: string | undefined,
        public type: TirType,
        public initExpr: TirExpr | undefined,
        public isConst: boolean,
        readonly range: SourceRange,
    ) {}


    toString(): string
    {
        return (
            `${this.isConst ? "const" : "let"} ` +
            `[ ` +
            this.elements
            .map( ( decl ) => 
                decl.toString()
            ).join(", ") +
            ( this.rest ? `, ...${this.rest}` : "" ) +
            ` }` +
            ( this.initExpr ? ` = ${this.initExpr.toString()}` : "" )
        );
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        const indent_0 = "\n" + indent_base;
        const indent_1 = indent_0 + singleIndent;

        const elemEntries = this.elements.map(
            ( decl ) => decl.pretty( indent + 1 )
        );

        const elemsPart =
            elemEntries.length === 0
            ? ""
            : indent_1 + elemEntries.join(`,${indent_1}`);

        const restPart =
            this.rest
            ? ( elemEntries.length === 0 ? indent_1 : `,${indent_1}` ) + `...${this.rest}`
            : "";

        const closing =
            elemEntries.length === 0 && !this.rest
            ? " [ ]"
            : `${indent_0}]`;

        return (
            `${indent_base}${this.isConst ? "const" : "let"} [` +
            elemsPart +
            restPart +
            closing +
            ( this.initExpr ? ` = ${this.initExpr.pretty( indent )}` : "" )
        );
    }

    deps(): string[]
    {
        return this.initExpr?.deps() ?? [];
    }

    definitelyTerminates(): boolean { return false; }

    introducedVars(): string[]
    {
        const introducedVars: string[] = [];
        for (const element of this.elements) {
            mergeSortedStrArrInplace( introducedVars, element.introducedVars() );
        }
        if (this.rest) mergeSortedStrArrInplace( introducedVars, [ this.rest ] );
        return introducedVars;
    }
}