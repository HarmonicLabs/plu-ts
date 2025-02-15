import { isVarDecl, VarDecl } from "./nodes/statements/declarations/VarDecl/VarDecl";
import { Identifier } from "./nodes/common/Identifier";
import { isPebbleExpr, PebbleExpr } from "./nodes/expr/PebbleExpr";
import { isPebbleStmt, PebbleStmt } from "./nodes/statements/PebbleStmt";
import { isAstTypeExpr, AstTypeExpr } from "./nodes/types/AstTypeExpr";
import { isPebbleDecl, PebbleDecl } from "./nodes/statements/declarations/PebbleDecl";


export type PebbleAst
    = VarDecl
    | PebbleStmt
    | PebbleExpr
    | AstTypeExpr
    | Identifier
    | PebbleDecl
    ;

export function isPebbleAst( thing: any ): thing is PebbleAst
{
    return (
        thing instanceof Identifier
        || isVarDecl( thing )
        || isPebbleStmt( thing )
        || isPebbleExpr( thing )
        || isAstTypeExpr( thing )
        || isPebbleDecl( thing )
    );
}