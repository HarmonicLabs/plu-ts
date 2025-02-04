import { CommonFlags } from "../../../../common";
import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { ArrowKind } from "../../expr/functions/ArrowKind";
import { PebbleExpr } from "../../expr/PebbleExpr";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { NamedType } from "../../types/NamedType";
import { FuncType } from "../../types/NativeType";
import { PebbleType } from "../../types/PebbleType";

export class FuncDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly flags: CommonFlags,
        readonly typeParams: PebbleType[],
        readonly signature: FuncType,
        readonly body: BlockStmt | PebbleExpr,
        readonly arrowKind: ArrowKind,
        readonly range: SourceRange,
    ) {}
}