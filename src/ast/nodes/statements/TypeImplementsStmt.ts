import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { NamedType } from "../types/NamedType";
import { FuncType } from "../types/NativeType";
import { PebbleType } from "../types/PebbleType";
import { BlockStmt } from "./BlockStmt";


export class TypeImplementsStmt
    implements HasSourceRange
{
    constructor(
        readonly typeIdentifier: PebbleType,
        readonly interfaceType: PebbleType | undefined,
        readonly methodImplementations: InterfaceMethodImpl[],
        readonly range: SourceRange,
    ) {}
}

export class InterfaceMethodImpl
    implements HasSourceRange
{
    constructor(
        readonly methodName: Identifier,
        readonly typeParameters: PebbleType[],
        readonly signature: FuncType,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}