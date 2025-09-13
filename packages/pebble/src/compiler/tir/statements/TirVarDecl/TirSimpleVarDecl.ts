import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";
import { ITirStmt, Termination } from "../TirStmt";
import { ITirVarDecl } from "./TirVarDecl";

export class TirSimpleVarDecl
    implements ITirStmt, ITirVarDecl
{
    constructor(
        readonly name: string,
        readonly type: TirType,
        public initExpr: TirExpr | undefined, // deconstructed OR function param
        public isConst: boolean,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return (
            `${this.isConst ? "const" : "let"} ${this.name}: ${this.type.toString()}` +
            ( this.initExpr ? ` = ${this.initExpr.toString()}` : "" )
        );
    }

    deps(): string[]
    {
        return this.initExpr?.deps() ?? [];
    }

    definitelyTerminates(): boolean { return false; }

    introducedVars(): string[]
    {
        return [ this.name ];
    }
}