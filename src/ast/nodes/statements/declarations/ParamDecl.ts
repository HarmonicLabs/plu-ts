import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { SourceRange } from "../../../Source/SourceRange";
import { AstTypeExpr } from "../../types/AstTypeExpr";

export class ParamDecl implements HasSourceRange
{
    readonly name: Identifier;
    readonly type: AstTypeExpr;
    readonly range: SourceRange;

    constructor(
        name: Identifier,
        type: AstTypeExpr,
        range: SourceRange
    )
    {
        this.name = name;
        this.type = type;
        this.range = range;
    }
}
