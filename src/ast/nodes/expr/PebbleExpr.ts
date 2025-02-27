import { CaseExpr } from "./CaseExpr";
import { CommaExpr } from "./CommaExpr";
import { ElemAccessExpr } from "./ElemAccessExpr";
import { CallExpr } from "./functions/CallExpr";
import { FuncExpr } from "./functions/FuncExpr";
import { IsExpr } from "./IsExpr";
import { isLitteralExpr, LitteralExpr } from "./litteral/LitteralExpr";
import { NonNullExpr } from "./unary/NonNullExpr";
import { ParentesizedExpr } from "./ParentesizedExpr";
import { isPropAccessExpr, PropAccessExpr } from "./PropAccessExpr";
import { TernaryExpr } from "./TernaryExpr";
import { TypeConversionExpr } from "./TypeConversionExpr";
import { isUnaryPostfixExpr, UnaryPostfixExpr } from "./unary/UnaryPostfixExpr";
import { isUnaryPrefixExpr, UnaryPrefixExpr } from "./unary/UnaryPrefixExpr";

/**
 * an expression is anything that can be evaluated to a value
 * it must therefore have a type
 */
export type PebbleExpr
    = UnaryPrefixExpr
    | UnaryPostfixExpr
    | LitteralExpr
    | ParentesizedExpr
    | FuncExpr
    | CallExpr
    | CaseExpr
    | TypeConversionExpr
    | NonNullExpr
    | IsExpr // ( purpose is Spending )
    | ElemAccessExpr
    | TernaryExpr
    | CommaExpr
    | PropAccessExpr
    ;

export function isPebbleExpr( thing: any ): thing is PebbleExpr
{
    return (
        isUnaryPrefixExpr( thing )
        || isUnaryPostfixExpr( thing )
        || isLitteralExpr( thing )
        || thing instanceof ParentesizedExpr
        || thing instanceof FuncExpr
        || thing instanceof CallExpr
        || thing instanceof CaseExpr
        || thing instanceof TypeConversionExpr
        || thing instanceof NonNullExpr
        || thing instanceof IsExpr
        || thing instanceof ElemAccessExpr
        || thing instanceof TernaryExpr
        || thing instanceof CommaExpr
        || isPropAccessExpr( thing )
    );
}