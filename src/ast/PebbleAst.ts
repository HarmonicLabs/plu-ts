import { isVarDecl, VarDecl } from "./nodes/declarations/VarDecl/VarDecl";
import { Identifier } from "./nodes/common/Identifier";
import { isPebbleExpr, PebbleExpr } from "./nodes/expr/PebbleExpr";
import { isPebbleStmt, PebbleStmt } from "./nodes/statements/PebbleStmt";
import { isPebbleType, PebbleType } from "./nodes/types/PebbleType";


export type PebbleAst
    = VarDecl
    | PebbleStmt
    | PebbleExpr
    | PebbleType
    | Identifier
    ;

export function isPebbleAst( thing: any ): thing is PebbleAst
{
    return (
        thing instanceof Identifier ||
        isVarDecl( thing )          ||
        isPebbleStmt( thing )       ||
        isPebbleExpr( thing )       ||
        isPebbleType( thing )
    );
}