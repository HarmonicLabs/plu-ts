import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstNamedType } from "../types/AstNamedType";
import { AstFuncType } from "../types/AstNativeType";
import { PebbleAstType } from "../types/PebbleAstType";
import { BlockStmt } from "./BlockStmt";


export class TypeImplementsStmt
    implements HasSourceRange
{
    constructor(
        readonly typeIdentifier: PebbleAstType,
        readonly interfaceType: PebbleAstType | undefined,
        readonly methodImplementations: InterfaceMethodImpl[],
        readonly range: SourceRange,
    ) {}
}

export class InterfaceMethodImpl
    implements HasSourceRange
{
    constructor(
        readonly methodName: Identifier,
        readonly typeParameters: PebbleAstType[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}