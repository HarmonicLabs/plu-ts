import { isObject } from "@harmoniclabs/obj-utils";
import { isTirLitteralExpr, TirLitteralExpr } from "./litteral/TirLitteralExpr";
import { TirCallExpr } from "./TirCallExpr";
import { TirCaseExpr } from "./TirCaseExpr";
import { TirElemAccessExpr } from "./TirElemAccessExpr";
import { TirFuncExpr } from "./TirFuncExpr";
import { TirParentesizedExpr } from "./TirParentesizedExpr";
import { TirPropAccessExpr } from "./TirPropAccessExpr";
import { TirTernaryExpr } from "./TirTernaryExpr";
import { isTirUnaryPrefixExpr, TirUnaryPrefixExpr } from "./unary/TirUnaryPrefixExpr";
import { isTirBinaryExpr, TirBinaryExpr } from "./binary/TirBinaryExpr";
import { TirVariableAccessExpr } from "./TirVariableAccessExpr";
import { TirTypeConversionExpr } from "./TirTypeConversionExpr";
import { TirLettedExpr } from "./TirLettedExpr";
import { TirNativeFuncExpr } from "./TirNativeFuncExpr";
import { TirFromDataExpr } from "./TirFromDataExpr";
import { TirFailExpr } from "./TirFailExpr";
import { TirHoistedExpr } from "./TirHoistedExpr";
import { TirToDataExpr } from "./TirToDataExpr";

export type TirExpr
    =( TirUnaryPrefixExpr
    | TirLitteralExpr
    | TirParentesizedExpr
    | TirFuncExpr
    | TirCallExpr
    | TirCaseExpr
    | TirTypeConversionExpr
    // | TirIsExpr // ( purpose is Spending )
    | TirElemAccessExpr // arr[idx]
    | TirTernaryExpr
    | TirPropAccessExpr
    | TirBinaryExpr
    | TirVariableAccessExpr
    | TirLettedExpr
    | TirNativeFuncExpr
    | TirFailExpr
    | TirHoistedExpr
    | TirFromDataExpr
    | TirToDataExpr
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
        // || thing instanceof TirIsExpr
        || thing instanceof TirElemAccessExpr
        || thing instanceof TirTernaryExpr
        || thing instanceof TirPropAccessExpr
        || isTirBinaryExpr( thing )
        || thing instanceof TirVariableAccessExpr
        || thing instanceof TirLettedExpr
        || thing instanceof TirNativeFuncExpr
        || thing instanceof TirFailExpr
        || thing instanceof TirHoistedExpr
        || thing instanceof TirFromDataExpr
        || thing instanceof TirToDataExpr
    );
}