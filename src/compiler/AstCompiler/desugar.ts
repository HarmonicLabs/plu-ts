import { PebbleStmt } from "../../ast/nodes/statements/PebbleStmt";
import { VarStmt } from "../../ast/nodes/statements/VarStmt";

export function desugarVarStatements( stmts: PebbleStmt[] ): void
{
    for( let i = 0; i < stmts.length; ++i )
    {
        const stmt = stmts[ i ];

        if( stmt instanceof VarStmt )
        {
            if( stmt.declarations.length > 1 )
            {
                const newStmts: PebbleStmt[] = [];

                for( const decl of stmt.declarations )
                {
                    newStmts.push( new VarStmt( [ decl ], decl.range ) );
                }

                stmts.splice( i, 1, ...newStmts );
                i--;
                continue; // desugar single declarations
            }
            if( stmt.declarations.length <= 0 ) throw new Error( "Empty VarStmt" );
        }
    }
}