import { isObject } from "@harmoniclabs/obj-utils";
import { isTirLitteralExpr, TirLitteralExpr } from "./litteral/TirLitteralExpr";
import { TirCallExpr } from "./TirCallExpr";
import { TirCaseExpr } from "./TirCaseExpr";
import { TirElemAccessExpr } from "./TirElemAccessExpr";
import { TirFuncExpr } from "./TirFuncExpr";
import { TirIsExpr } from "./TirIsExpr";
import { TirParentesizedExpr } from "./TirParentesizedExpr";
import { isTirPropAccessExpr, TirPropAccessExpr } from "./TirPropAccessExpr";
import { TirTernaryExpr } from "./TirTernaryExpr";
import { isTirUnaryPrefixExpr, TirUnaryPrefixExpr } from "./unary/TirUnaryPrefixExpr";
import { isTirBinaryExpr, TirBinaryExpr } from "./binary/TirBinaryExpr";
import { TirVariableAccessExpr } from "./TirVariableAccessExpr";
import { TirNonNullExpr } from "./TirNonNullExpr";
import { TirTypeConversionExpr } from "./TirTypeConversionExpr";

export type TirExpr
    =( TirUnaryPrefixExpr
    | TirNonNullExpr
    | TirLitteralExpr
    | TirParentesizedExpr
    | TirFuncExpr
    | TirCallExpr
    | TirCaseExpr
    | TirTypeConversionExpr
    | TirIsExpr // ( purpose is Spending )
    | TirElemAccessExpr // arr[idx]
    | TirTernaryExpr
    | TirPropAccessExpr
    | TirBinaryExpr
    | TirVariableAccessExpr
    )
    // & ITirExpr
    ;

export function isTirExpr( thing: any ): thing is TirExpr
{
    return isObject( thing ) && (
        isTirUnaryPrefixExpr( thing )
        || isTirLitteralExpr( thing )
        || thing instanceof TirParentesizedExpr
        || thing instanceof TirFuncExpr
        || thing instanceof TirCallExpr
        || thing instanceof TirCaseExpr
        || thing instanceof TirTypeConversionExpr
        || thing instanceof TirIsExpr
        || thing instanceof TirElemAccessExpr
        || thing instanceof TirTernaryExpr
        || isTirPropAccessExpr( thing )
        || isTirBinaryExpr( thing )
        || thing instanceof TirVariableAccessExpr
    );
}