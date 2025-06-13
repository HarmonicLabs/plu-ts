import { SourceRange } from "../../../../ast/Source/SourceRange";
import { CommonFlags } from "../../../../common";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";
import { ITirStmt } from "../TirStmt";
import { ITirVarDecl, TirVarDecl } from "./TirVarDecl";

export class TirNamedDeconstructVarDecl
    implements ITirStmt, ITirVarDecl
{
    constructor(
        /** only original (not aliased) constr name used in destructuring */
        readonly constrName: string,
        readonly fields: Map<string, TirVarDecl>,
        readonly rest: string | undefined,
        readonly type: TirType,
        public initExpr: TirExpr | undefined,
        public isConst: boolean,
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean
    {
        return false;
    }

    deps(): string[]
    {
        return this.initExpr?.deps() ?? [];
    }

    definitelyTerminates(): boolean { return false; }

    introducedVars(): string[]
    {
        const introducedVars: string[] = [];
        for (const field of this.fields.values()) {
            mergeSortedStrArrInplace( introducedVars, field.introducedVars() );
        }
        if (this.rest) mergeSortedStrArrInplace( introducedVars, [ this.rest ] );
        return introducedVars;
    }
}