import { TirExpr } from "../TirExpr";

export interface NamedExpr {
    name: string;
    expr: TirExpr;
}