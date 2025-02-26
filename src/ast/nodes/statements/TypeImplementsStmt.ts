import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstFuncType } from "../types/AstNativeTypeExpr";
import { AstTypeExpr } from "../types/AstTypeExpr";
import { BlockStmt } from "./BlockStmt";


export class TypeImplementsStmt
    implements HasSourceRange
{
    constructor(
        readonly typeIdentifier: AstTypeExpr,
        readonly interfaceType: AstTypeExpr | undefined,
        readonly methodImplementations: InterfaceMethodImpl[],
        readonly range: SourceRange,
    ) {}
}

export class InterfaceMethodImpl
    implements HasSourceRange
{
    constructor(
        readonly methodName: Identifier,
        readonly typeParameters: AstTypeExpr[],
        readonly signature: AstFuncType,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}