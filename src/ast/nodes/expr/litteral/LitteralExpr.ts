import { LitFalseExpr } from "./LitFalseExpr";
import { LitThisExpr } from "./LitThisExpr";
import { LitTrueExpr } from "./LitTrueExpr";
import { LitUndefExpr } from "./LitUndefExpr";
import { LitVoidExpr } from "./LitVoidExpr";

export type LitteralExpr
    = LitVoidExpr
    | LitUndefExpr
    | LitTrueExpr
    | LitFalseExpr
    | LitThisExpr

export function isLitteralExpr( thing: any ): thing is LitteralExpr
{
    return (
        thing instanceof LitVoidExpr ||
        thing instanceof LitUndefExpr ||
        thing instanceof LitTrueExpr ||
        thing instanceof LitFalseExpr ||
        thing instanceof LitThisExpr
    );
}