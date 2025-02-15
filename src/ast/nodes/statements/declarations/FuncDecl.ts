import { CommonFlags } from "../../../../common";
import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { ArrowKind } from "../../expr/functions/ArrowKind";
import { PebbleExpr } from "../../expr/PebbleExpr";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { AstNamedTypeExpr } from "../../types/AstNamedTypeExpr";
import { AstFuncType } from "../../types/AstNativeTypeExpr";
import { AstTypeExpr } from "../../types/AstTypeExpr";

export class FuncDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly flags: CommonFlags,
        readonly typeParams: Identifier[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt | PebbleExpr,
        readonly arrowKind: ArrowKind,
        readonly range: SourceRange,
    ) {}
}