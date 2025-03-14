import { LitArrExpr } from "./LitArrExpr";
import { LitFalseExpr } from "./LitFalseExpr";
import { LitHexBytesExpr } from "./LitHexBytesExpr";
import { LitIntExpr } from "./LitIntExpr";
import { LitNamedObjExpr } from "./LitNamedObjExpr";
import { LitObjExpr } from "./LitObjExpr";
import { LitStrExpr } from "./LitStrExpr";
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
    | LitArrExpr
    | LitObjExpr
    | LitNamedObjExpr
    | LitStrExpr
    | LitIntExpr
    | LitHexBytesExpr

export function isLitteralExpr( thing: any ): boolean // thing is LitteralExpr
{
    return (
        thing instanceof LitVoidExpr
        || thing instanceof LitUndefExpr
        || thing instanceof LitTrueExpr
        || thing instanceof LitFalseExpr
        || thing instanceof LitThisExpr
        || thing instanceof LitArrExpr
        || thing instanceof LitObjExpr
        || thing instanceof LitNamedObjExpr
        || thing instanceof LitStrExpr
        || thing instanceof LitIntExpr
        || thing instanceof LitHexBytesExpr
    );
}