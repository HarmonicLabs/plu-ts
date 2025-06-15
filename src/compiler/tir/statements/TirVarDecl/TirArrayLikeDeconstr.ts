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