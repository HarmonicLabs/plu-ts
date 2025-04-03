import { ArrayLikeDeconstr } from "../../../../ast/nodes/statements/declarations/VarDecl/ArrayLikeDeconstr";
import { NamedDeconstructVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/NamedDeconstructVarDecl";
import { SimpleVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { SingleDeconstructVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/SingleDeconstructVarDecl";
import { MatchStmt, MatchStmtCase } from "../../../../ast/nodes/statements/MatchStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirMatchStmt, TirMatchStmtCase } from "../../../tir/statements/TirMatchStmt";
import { TirDataT, TirOptT, TirListT, TirLinearMapT } from "../../../tir/types/TirNativeType";
import { TirStructType } from "../../../tir/types/TirStructType";
import { getDeconstructableType, DeconstructableTirType } from "../../../tir/types/type-check-utils/getDeconstructableType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { wrapManyStatements } from "../../utils/wrapManyStatementsOrReturnSame";
import { _compileExpr } from "../exprs/_compileExpr";
import { _compileStatement } from "./_compileStatement";
import { _compileArrayLikeDeconstr, _compileNamedDeconstructVarDecl, _compileSingleDeconstructVarDecl, _compileVarDecl } from "./_compileVarStmt";

export function _compileMatchStmt(
    ctx: AstCompilationCtx,
    stmt: MatchStmt
): [ TirMatchStmt ] | undefined
{
    if( !ctx.functionCtx ) return ctx.error(
        DiagnosticCode.A_match_statement_can_only_be_used_within_a_function_body,
        stmt.range
    );

    const matchExpr = _compileExpr( ctx, stmt.matchExpr, undefined );
    if( !matchExpr ) return undefined;

    const matchExprType = matchExpr.type;
    const deconstructableType = getDeconstructableType( matchExprType );
    if( !deconstructableType ) return ctx.error(
        DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed,
        stmt.matchExpr.range, matchExprType.toString()
    );

    if( stmt.cases.length === 0 ) return ctx.error(
        DiagnosticCode.A_match_statement_must_have_at_least_one_case,
        stmt.range
    );

    const cases: TirMatchStmtCase[] = [];
    const constrNamesAlreadySpecified: string[] = [];
    for( const matchCase of stmt.cases )
    {
        const branch = _compileTirMatchStmtCase(
            ctx,
            matchCase,
            deconstructableType,
            constrNamesAlreadySpecified
        );
        if( !branch ) return undefined;
        cases.push( branch );
    }

    return [ new TirMatchStmt(
        matchExpr,
        cases,
        stmt.range
    ) ];
}
export function _compileTirMatchStmtCase(
    ctx: AstCompilationCtx,
    matchCase: MatchStmtCase,
    deconstructableType: DeconstructableTirType,
    constrNamesAlreadySpecified: string[]
): TirMatchStmtCase | undefined
{
    const pattern = _compileVarDecl( ctx, matchCase.pattern, deconstructableType );
    if( !pattern ) return undefined;

    if( pattern instanceof SimpleVarDecl ) 
        return ctx.error(
            DiagnosticCode.The_argument_of_a_match_statement_branch_must_be_deconstructed,
            matchCase.pattern.range
        );
    else if( pattern instanceof NamedDeconstructVarDecl ) {
        const deconstructedCtorIdentifier = pattern.name;
        const deconstructedCtorName = deconstructedCtorIdentifier.text;

        if( constrNamesAlreadySpecified.includes( deconstructedCtorName ) )
        return ctx.error(
            DiagnosticCode.Constructor_0_was_already_specified,
            deconstructedCtorIdentifier.range, deconstructedCtorName
        );
        constrNamesAlreadySpecified.push( deconstructedCtorName );

        if( deconstructableType instanceof TirDataT )
        {
            if(!(
                    deconstructedCtorName === "Constr"   // { index, fields, ...rest }
                || deconstructedCtorName === "Map"      // { map, ...rest }
                || deconstructedCtorName === "List"     // { list, ...rest }
                || deconstructedCtorName === "B"        // { bytes, ...rest }
                || deconstructedCtorName === "I"        // { int, ...rest }
            )) return ctx.error(
                DiagnosticCode.Unknown_0_constructor_1,
                pattern.name.range, "data", deconstructedCtorName
            );

            const branchCtx = ctx.newBranchChildScope();

            const branchArg = _compileNamedDeconstructVarDecl(
                branchCtx,
                pattern,
                deconstructableType
            );
            if( !branchArg ) return undefined;
            const branchBody = wrapManyStatements(
                _compileStatement(
                    branchCtx,
                    matchCase.body
                ),
                matchCase.body.range
            );
            if( !branchBody ) return undefined;

            return new TirMatchStmtCase(
                branchArg,
                branchBody,
                matchCase.range
            );
        }
        else if( deconstructableType instanceof TirOptT )
        {
            if(!(
                    deconstructedCtorName === "Some"     // { value, ...rest }
                || deconstructedCtorName === "None"     // { ...rest }
            )) return ctx.error(
                DiagnosticCode.Unknown_0_constructor_1,
                pattern.name.range, "Optional", deconstructedCtorName
            );

            const branchCtx = ctx.newBranchChildScope();

            const branchArg = _compileNamedDeconstructVarDecl(
                branchCtx,
                pattern,
                deconstructableType
            );
            if( !branchArg ) return undefined;
            const branchBody = wrapManyStatements(
                _compileStatement(
                    branchCtx,
                    matchCase.body
                ),
                matchCase.body.range
            );
            if( !branchBody ) return undefined;

            return new TirMatchStmtCase(
                branchArg,
                branchBody,
                matchCase.range
            );
        }
        else if( deconstructableType instanceof TirStructType )
        {
            const ctorDef = deconstructableType.constructors.find( c => c.name === deconstructedCtorName );
            if( !ctorDef ) return ctx.error(
                DiagnosticCode.Unknown_0_constructor_1,
                pattern.name.range, deconstructableType.toString(), deconstructedCtorName
            );

            const branchCtx = ctx.newBranchChildScope();

            const branchArg = _compileNamedDeconstructVarDecl(
                branchCtx,
                pattern,
                deconstructableType
            );
            if( !branchArg ) return undefined;
            const branchBody = wrapManyStatements(
                _compileStatement(
                    branchCtx,
                    matchCase.body
                ),
                matchCase.body.range
            );
            if( !branchBody ) return undefined;

            return new TirMatchStmtCase(
                branchArg,
                branchBody,
                matchCase.range
            );
        }
        // else if( deconstructableType instanceof TirListT )
        // else if( deconstructableType instanceof TirLinearMapT )
        else return ctx.error(
            DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_by_named_object,
            matchCase.pattern.range, deconstructableType.toString()
        )
    }
    else if( pattern instanceof SingleDeconstructVarDecl )
    {
        if(!( deconstructableType instanceof TirStructType ))
        return ctx.error(
            DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_as_unnamed_object,
            matchCase.pattern.range, deconstructableType.toString()
        );

        if( deconstructableType.constructors.length !== 1 )
        return ctx.error(
            DiagnosticCode.A_value_of_type_0_has_multiple_constructors,
            matchCase.pattern.range, deconstructableType.toString()
        );

        const branchCtx = ctx.newBranchChildScope();

        const branchArg = _compileSingleDeconstructVarDecl(
            branchCtx,
            pattern,
            deconstructableType
        );
        if( !branchArg ) return undefined;
        const branchBody = wrapManyStatements(
            _compileStatement(
                branchCtx,
                matchCase.body
            ),
            matchCase.body.range
        );
        if( !branchBody ) return undefined;

        return new TirMatchStmtCase(
            branchArg,
            branchBody,
            matchCase.range
        );
    }
    else if( pattern instanceof ArrayLikeDeconstr )
    {
        if(!(
            deconstructableType instanceof TirListT
            || deconstructableType instanceof TirLinearMapT
        )) return ctx.error(
            DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_as_an_array,
            matchCase.pattern.range, deconstructableType.toString()
        );

        const branchCtx = ctx.newBranchChildScope();

        const branchArg = _compileArrayLikeDeconstr(
            branchCtx,
            pattern,
            deconstructableType
        );
        if( !branchArg ) return undefined;
        const branchBody = wrapManyStatements(
            _compileStatement(
                branchCtx,
                matchCase.body
            ),
            matchCase.body.range
        );
        if( !branchBody ) return undefined;

        return new TirMatchStmtCase(
            branchArg,
            branchBody,
            matchCase.range
        );
    }
    }