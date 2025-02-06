import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { NamedType } from "../types/NamedType";
import { FuncType } from "../types/NativeType";
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
        readonly signature: FuncType,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}