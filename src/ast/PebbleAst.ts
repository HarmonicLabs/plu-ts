import { isVarDecl, VarDecl } from "./nodes/statements/declarations/VarDecl/VarDecl";
import { Identifier } from "./nodes/common/Identifier";
import { isPebbleExpr, PebbleExpr } from "./nodes/expr/PebbleExpr";
import { isPebbleStmt, PebbleStmt } from "./nodes/statements/PebbleStmt";
import { isAstTypeExpr, AstTypeExpr } from "./nodes/types/AstTypeExpr";
import { isPebbleAstTypeDecl, PebbleAstTypeDecl } from "./nodes/statements/declarations/PebbleAstTypeDecl";


export type PebbleAst
    = VarDecl
    | PebbleStmt
    | PebbleExpr
    | AstTypeExpr
    | Identifier
    | PebbleAstTypeDecl
    ;

export function isPebbleAst( thing: any ): thing is PebbleAst
{
    return (
        thing instanceof Identifier
        || isVarDecl( thing )
        || isPebbleStmt( thing )
        || isPebbleExpr( thing )
        || isAstTypeExpr( thing )
        || isPebbleAstTypeDecl( thing )
    );
}