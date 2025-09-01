import { isVarDecl, VarDecl } from "./nodes/statements/declarations/VarDecl/VarDecl";
import { Identifier } from "./nodes/common/Identifier";
import { isPebbleExpr, PebbleExpr } from "./nodes/expr/PebbleExpr";
import { isAstTypeExpr, AstTypeExpr } from "./nodes/types/AstTypeExpr";
import { BodyStmt, isBodyStmt, isTopLevelStmt, TopLevelStmt } from "./nodes/statements/PebbleStmt";
import { isPebbleTypeDecl, PebbleTypeDecl } from "./nodes/statements/declarations/PebbleTypeDecl";


export type PebbleAst
    = VarDecl
    | TopLevelStmt
    | BodyStmt
    | PebbleExpr
    | AstTypeExpr
    | Identifier
    | PebbleTypeDecl
    ;

export function isPebbleAst( thing: any ): thing is PebbleAst
{
    return (
        thing instanceof Identifier
        || isVarDecl( thing )
        || isTopLevelStmt( thing )
        || isBodyStmt( thing )
        || isPebbleExpr( thing )
        || isAstTypeExpr( thing )
        || isPebbleTypeDecl( thing )
    );
}