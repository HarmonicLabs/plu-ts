import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirBlockStmt } from "../../tir/statements/TirBlockStmt";
import { TirStmt } from "../../tir/statements/TirStmt";

export function wrapManyStatements(
    stmts: TirStmt[] | undefined,
    range: SourceRange
): TirStmt | undefined
{
    if( !Array.isArray( stmts ) ) return undefined;
    if( stmts.length === 0 ) return new TirBlockStmt( [], range );
    
    if( stmts.length === 1 )
        return stmts[0];
    else return new TirBlockStmt(
        stmts,
        SourceRange.join( stmts[0].range, stmts[stmts.length - 1].range )
    )
}