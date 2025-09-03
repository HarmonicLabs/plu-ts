import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { FuncDecl } from "./FuncDecl";
import { SimpleVarDecl } from "./VarDecl/SimpleVarDecl";

export class ContractDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly params: SimpleVarDecl[],
        readonly spendMathods: FuncDecl[],
        readonly mintMethods: FuncDecl[],
        readonly certifyMethods: FuncDecl[],
        readonly withdrawMethods: FuncDecl[],
        readonly proposeMethods: FuncDecl[],
        readonly voteMethods: FuncDecl[],
        readonly range: SourceRange
    ) {}
}