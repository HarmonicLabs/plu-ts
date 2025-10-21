import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { IRConst, IRConstr, IRTerm } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { TirDataOptT } from "../../types/TirNativeType/native/Optional/data";
import { TirSopOptT } from "../../types/TirNativeType/native/Optional/sop";
import { TirExpr } from "../TirExpr";

export class TirLitUndefExpr implements ITirExpr
{
    readonly isConstant: boolean = true;
    
    constructor(
        /** must be an optional */
        readonly type: TirSopOptT | TirDataOptT,
        readonly range: SourceRange
    ) {}

    pretty(): string { return this.toString(); }
    toString(): string
    {
        return "undefined";
    }

    clone(): TirExpr
    {
        return new TirLitUndefExpr(
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return this.type instanceof TirSopOptT ?
            new IRConstr( 1, [] ) :
            IRConst.data( new DataConstr( 1, [] ) )
    }
}