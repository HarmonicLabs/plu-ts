import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { AstNamedType } from "../../types/AstNamedType";
import { AstFuncType } from "../../types/AstNativeType";
import { PebbleAstType } from "../../types/PebbleAstType";

export class InterfaceDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: PebbleAstType[],
        readonly methods: InterfaceDeclMethod[],
        readonly range: SourceRange
    ) {}
}

export class InterfaceDeclMethod
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: PebbleAstType[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt | undefined,
        readonly range: SourceRange
    ) {}
}