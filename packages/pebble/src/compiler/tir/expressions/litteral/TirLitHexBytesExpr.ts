import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bytes_t } from "../../program/stdScope/stdScope";
import { IRTerm, IRConst } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { toHex } from "@harmoniclabs/uint8array-utils";

export class TirLitHexBytesExpr
    implements ITirExpr
{
    readonly type: TirType = bytes_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly bytes: Uint8Array,
        readonly range: SourceRange
    ) {}
    
    toString(): string
    {
        return `#${toHex( this.bytes )}`;
    }

    clone(): TirLitHexBytesExpr
    {
        return new TirLitHexBytesExpr(
            new Uint8Array(this.bytes),
            this.range.clone()
        );
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.bytes( this.bytes );
    }
}