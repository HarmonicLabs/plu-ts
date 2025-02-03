import { CaseExpr } from "./CaseExpr";
import { CallExpr } from "./functions/CallExpr";
import { FuncExpr } from "./functions/FuncExpr";
import { isLitteralExpr, LitteralExpr } from "./litteral/LitteralExpr";
import { ParentesizedExpr } from "./ParentesizedExpr";
import { isUnaryPrefixExpr, UnaryPrefixExpr } from "./unary/UnaryPrefixExpr";

/**
 * an expression is anything that can be evaluated to a value
 * it must therefore have a type
 */
export type PebbleExpr
    = UnaryPrefixExpr
    | LitteralExpr
    | ParentesizedExpr
    | FuncExpr
    | CallExpr
    | CaseExpr

export function isPebbleExpr( thing: any ): thing is PebbleExpr
{
    return (
        isUnaryPrefixExpr( thing )
        || isLitteralExpr( thing )
        || thing instanceof ParentesizedExpr
        || thing instanceof FuncExpr
        || thing instanceof CallExpr
        || thing instanceof CaseExpr
    );
}