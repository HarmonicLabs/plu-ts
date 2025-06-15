import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class TirForOfStmt
    implements ITirStmt
{
    constructor(
        readonly elemDeclaration: TirVarDecl,
        readonly iterable: TirExpr,
        public body: TirStmt,
        readonly range: SourceRange,
    ) {}

    definitelyTerminates(): boolean {
        return this.body.definitelyTerminates();
    }

    deps(): string[]
    {
        const deps = this.iterable.deps();
        const introducedVars = this.elemDeclaration.introducedVars();

        return mergeSortedStrArrInplace(
            deps,
            filterSortedStrArrInplace(
                this.body.deps(),
                introducedVars
            )
        );
    }
}