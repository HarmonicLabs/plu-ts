import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { IRConst, IRConstr, IRTerm } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { TirDataOptT, TirSopOptT } from "../../types/TirNativeType";
import { DataConstr } from "@harmoniclabs/plutus-data";

export class TirLitUndefExpr implements ITirExpr
{
    readonly isConstant: boolean = true;
    
    constructor(
        /** must be an optional */
        readonly type: TirSopOptT | TirDataOptT,
        readonly range: SourceRange
    ) {}

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return this.type instanceof TirSopOptT ?
            new IRConstr( 1, [] ) :
            IRConst.data( new DataConstr( 1, [] ) )
    }
}