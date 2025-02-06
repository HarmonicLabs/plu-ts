import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleAstType } from "../../types/PebbleAstType";
import { VarDecl } from "./VarDecl/VarDecl";


export class StructDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: PebbleAstType[],
        readonly constrs: StructConstrDecl[],
        readonly range: SourceRange
    ) {}
}

export class StructConstrDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly fields: VarDecl[],
        readonly range: SourceRange
    ) {}
}