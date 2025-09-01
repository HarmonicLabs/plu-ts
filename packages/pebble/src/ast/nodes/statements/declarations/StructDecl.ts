import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { SimpleVarDecl } from "./VarDecl/SimpleVarDecl";

export enum StructDeclAstFlags {
    none = 0 << 0,

    untaggedSingleConstructor = 1 << 0,
    onlyDataEncoding = 1 << 1,
    onlySopEncoding = 1 << 2,
}

export class StructDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: Identifier[],
        readonly constrs: StructConstrDecl[],
        readonly flags: StructDeclAstFlags,
        readonly range: SourceRange
    ) {}

    hasFlag(flag: StructDeclAstFlags): boolean {
        return (this.flags & flag) !== 0;
    }
}

export class StructConstrDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        // name and type
        readonly fields: SimpleVarDecl[],
        readonly range: SourceRange
    ) {}
}