import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { AstFuncType } from "../../types/AstNativeTypeExpr";

export class InterfaceDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: Identifier[],
        readonly methods: InterfaceDeclMethod[],
        readonly range: SourceRange
    ) {}
}

export class InterfaceDeclMethod
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        // readonly typeParams: AstTypeExpr[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt | undefined,
        readonly range: SourceRange
    ) {}
}