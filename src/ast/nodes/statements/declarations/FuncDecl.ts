import { CommonFlags } from "../../../../common";
import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { ArrowKind } from "../../expr/functions/ArrowKind";
import { PebbleExpr } from "../../expr/PebbleExpr";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { AstNamedType } from "../../types/AstNamedType";
import { AstFuncType } from "../../types/AstNativeType";
import { PebbleAstType } from "../../types/PebbleAstType";

export class FuncDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly flags: CommonFlags,
        readonly typeParams: PebbleAstType[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt | PebbleExpr,
        readonly arrowKind: ArrowKind,
        readonly range: SourceRange,
    ) {}
}