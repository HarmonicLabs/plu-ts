import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../BlockStmt";
import { NamedType } from "../../types/NamedType";
import { FuncType } from "../../types/NativeType";
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
        readonly signature: FuncType,
        readonly body: BlockStmt | undefined,
        readonly range: SourceRange
    ) {}
}