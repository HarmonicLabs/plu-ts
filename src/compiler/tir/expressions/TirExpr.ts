import { ITirExpr } from "./ITirExpr";
import { TirLitteralExpr } from "./litteral/TirLitteralExpr";
import { TirCallExpr } from "./TirCallExpr";
import { TirCaseExpr } from "./TirCaseExpr";
import { TirElemAccessExpr } from "./TirElemAccessExpr";
import { TirFuncExpr } from "./TirFuncExpr";
import { TirIsExpr } from "./TirIsExpr";
import { TirParentesizedExpr } from "./TirParentesizedExpr";
import { TirPropAccessExpr } from "./TirPropAccessExpr";
import { TirTernaryExpr } from "./TirTernaryExpr";
import { TirUnaryPostfixExpr } from "./unary/TirUnaryPostfixExpr";
import { TirUnaryPrefixExpr } from "./unary/TirUnaryPrefixExpr";

export type TirExpr
    =( TirUnaryPrefixExpr
    | TirUnaryPostfixExpr
    | TirLitteralExpr
    | TirParentesizedExpr
    | TirFuncExpr
    | TirCallExpr
    | TirCaseExpr
    | TirIsExpr // ( purpose is Spending )
    | TirElemAccessExpr // arr[idx]
    | TirTernaryExpr
    // | TirCommaExpr // comma expressions removed at compilation from AST (keep side-effects only)
    | TirPropAccessExpr
    )
    & ITirExpr
    ;