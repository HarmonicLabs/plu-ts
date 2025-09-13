import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bytes_t } from "../../program/stdScope/stdScope";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRConst, IRTerm } from "../../../../IR";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";

export class TirLitStrExpr
    implements ITirExpr
{
    readonly type: TirType = bytes_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly string: string,
        readonly range: SourceRange
    ) {}

    toString(): string
    {
        return `"${this.string}"`;
    }

    clone(): TirLitStrExpr
    {
        return new TirLitStrExpr(
            this.string,
            this.range.clone()
        );
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.bytes( fromUtf8( this.string ) );
    }
}