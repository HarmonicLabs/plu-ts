import { isVarDecl, VarDecl } from "./nodes/statements/declarations/VarDecl/VarDecl";
import { Identifier } from "./nodes/common/Identifier";
import { isPebbleExpr, PebbleExpr } from "./nodes/expr/PebbleExpr";
import { isPebbleStmt, PebbleStmt } from "./nodes/statements/PebbleStmt";
import { isPebbleAstType, PebbleAstType } from "./nodes/types/PebbleAstType";
import { isPebbleDecl, PebbleDecl } from "./nodes/statements/declarations/PebbleDecl";


export type PebbleAst
    = VarDecl
    | PebbleStmt
    | PebbleExpr
    | PebbleAstType
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
        || isPebbleAstType( thing )
        || isPebbleDecl( thing )
    );
}