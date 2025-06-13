import { SourceRange } from "../../../ast/Source/SourceRange";
import { getUniqueInternalName } from "../../internalVar";
import { TirLitVoidExpr } from "../../tir/expressions/litteral/TirLitVoidExpr";
import { TirCaseExpr, TirCaseMatcher, TirWildcardCaseMatcher } from "../../tir/expressions/TirCaseExpr";
import { TirExpr } from "../../tir/expressions/TirExpr";
import { TirFailExpr } from "../../tir/expressions/TirFailExpr";
import { TirFuncExpr } from "../../tir/expressions/TirFuncExpr";
import { TirLettedExpr } from "../../tir/expressions/TirLettedExpr";
import { TirVariableAccessExpr } from "../../tir/expressions/TirVariableAccessExpr";
import { TirAssertStmt } from "../../tir/statements/TirAssertStmt";
import { TirAssignmentStmt } from "../../tir/statements/TirAssignmentStmt";
import { TirBlockStmt } from "../../tir/statements/TirBlockStmt";
import { TirBreakStmt } from "../../tir/statements/TirBreakStmt";
import { TirContinueStmt } from "../../tir/statements/TirContinueStmt";
import { TirFailStmt } from "../../tir/statements/TirFailStmt";
import { TirForOfStmt } from "../../tir/statements/TirForOfStmt";
import { TirForStmt } from "../../tir/statements/TirForStmt";
import { TirIfStmt } from "../../tir/statements/TirIfStmt";
import { TirMatchStmt } from "../../tir/statements/TirMatchStmt";
import { TirReturnStmt } from "../../tir/statements/TirReturnStmt";
import { TirStmt } from "../../tir/statements/TirStmt";
import { TirArrayLikeDeconstr } from "../../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { isTirVarDecl, TirVarDecl } from "../../tir/statements/TirVarDecl/TirVarDecl";
import { TirWhileStmt } from "../../tir/statements/TirWhileStmt";
import { TirDataStructType, TirSoPStructType } from "../../tir/types/TirStructType";
import { ExpressifyCtx } from "./ExpressifyCtx";
import { expressifyVarAssignmentStmt } from "./expressifyVarAssignmentStmt";
import { isSingleConstrStruct } from "./isSingleConstrStruct";
import { expressifyVars } from "./expressifyVars";
import { toNamedDeconstructVarDecl } from "./toNamedDeconstructVarDecl";
import { flattenSopNamedDeconstructInplace_addTopDestructToCtx_getNestedDeconstruct } from "./flattenSopNamedDeconstructInplace_addTopDestructToCtx_getNestedDeconstruct";

export function expressify(
    func: TirFuncExpr,
    parentCtx: ExpressifyCtx | undefined = undefined
): void
{
    const ctx = new ExpressifyCtx( parentCtx, func.returnType );

    ctx.introduceFuncParams( func.params );

    func.body.stmts = [
        new TirReturnStmt(
            expressifyFuncBody( ctx, func.body.stmts ),
            func.body.range
        )
    ];
}

export function expressifyFuncBody(
    ctx: ExpressifyCtx,
    bodyStmts: TirStmt[],
    assertions: TirAssertStmt[] = []
): TirExpr
{
    bodyStmts = bodyStmts.slice();
    let stmt: TirStmt;
    while( stmt = bodyStmts.pop()! ) {

        // if( isTirVarDecl( stmt ) ) expressifyVarDecl( ctx, stmt );
        if( stmt instanceof TirSimpleVarDecl ) {
            if( !stmt.initExpr ) throw new Error("simple var decl without init expr");
            const initExpr = expressifyVars( ctx, stmt.initExpr );
            stmt.initExpr = initExpr;

            const lettedExpr = ctx.introduceLettedConstant(
                stmt.name,
                initExpr,
                stmt.range
            );

            if( !isSingleConstrStruct( stmt.type ) ) continue;

            if(
                ( initExpr instanceof TirVariableAccessExpr || initExpr instanceof TirLettedExpr )
                && ctx.properties.has( initExpr.varName )
            ) continue; // field extraction was already done
            
            if( stmt.type instanceof TirSoPStructType )
            {
                const pattern = getConstrDestructPattern(
                    stmt.type,
                    stmt.range,
                    undefined, // no init expr (pattern is used as case matcher)
                    0
                );
                ctx.introduceSopConstrFieldsAsProperties( stmt.name, pattern );
                // nested single constr structs
                // are added as destructed variables in the matcher body
                // using `getNestedDestructsInSingleSopDestructPattern`
                return new TirCaseExpr(
                    lettedExpr,
                    [ new TirCaseMatcher(
                        pattern,
                        expressifyFuncBody(
                            ctx,
                            (getNestedDestructsInSingleSopDestructPattern( pattern ) as TirStmt[])
                            .concat( bodyStmts )
                        ),
                        stmt.range
                    ) ],
                    undefined, // no wildcard case
                    ctx.returnType,
                    stmt.range
                );
            }
            else if( stmt.type instanceof TirDataStructType )
            {
                ctx.introduceSingleConstrDataLettedFields(
                    stmt.name,
                    stmt.initExpr,
                    stmt.type
                );
                continue;
            }
            continue;
        }
        else if( stmt instanceof TirBreakStmt ) throw new Error("break statement in function body.");
        else if( stmt instanceof TirContinueStmt ) throw new Error("continue statement in function body.");
        else if(
            stmt instanceof TirSingleDeconstructVarDecl
            || stmt instanceof TirNamedDeconstructVarDecl
        ) {
            stmt = toNamedDeconstructVarDecl( stmt );

            // for some reason typescript goes crazy with types here
            if( stmt instanceof TirBreakStmt ) throw new Error("unreachable");
            else if( stmt instanceof TirContinueStmt ) throw new Error("unreachable");
            else if( stmt instanceof TirSingleDeconstructVarDecl ) throw new Error("unreachable");

            if( !stmt.initExpr ) throw new Error("simple var decl without init expr");
            const initExpr = expressifyVars( ctx, stmt.initExpr );
            stmt.initExpr = initExpr;

            const lettedName = getUniqueInternalName( stmt.type.toString().toLowerCase() );
            const lettedExpr = ctx.introduceLettedConstant(
                lettedName,
                initExpr,
                stmt.range
            );

            if( stmt.type instanceof TirSoPStructType )
            {
                const nestedDeconstructs = flattenSopNamedDeconstructInplace_addTopDestructToCtx_getNestedDeconstruct(
                    stmt,
                    ctx
                );
                // nested single constr structs
                // are added as destructed variables in the matcher body
                // using `getNestedDestructsInSingleSopDestructPattern`
                return new TirCaseExpr(
                    lettedExpr,
                    [ new TirCaseMatcher(
                        stmt,
                        expressifyFuncBody(
                            ctx,
                            (nestedDeconstructs as TirStmt[])
                            .concat( bodyStmts )
                        ),
                        stmt.range
                    ) ],
                    new TirWildcardCaseMatcher(
                        new TirFailExpr( undefined, ctx.returnType, stmt.range ),
                        stmt.range
                    ),
                    ctx.returnType,
                    stmt.range
                );
            }
            else if( stmt.type instanceof TirDataStructType ) {
                
            }
        }
        else if( stmt instanceof TirArrayLikeDeconstr ) {
            
        }
        else if( stmt instanceof TirAssignmentStmt ) bodyStmts.unshift( expressifyVarAssignmentStmt( ctx, stmt ) );
        else if( stmt instanceof TirReturnStmt ) {
            if( stmt.value ) {
                const modifiedExpr =  expressifyVars( ctx, stmt.value );
                stmt.value = modifiedExpr;

                return modifiedExpr;
            }
            else return new TirLitVoidExpr( stmt.range );
        }
        else if( stmt instanceof TirBlockStmt ) {
            // inline the block
            bodyStmts = stmt.stmts.concat( bodyStmts );
            continue;
        }
        else if( stmt instanceof TirFailStmt ) {
            if( stmt.failMsgExpr ) {
                const modifiedExpr = expressifyVars( ctx, stmt.failMsgExpr );
                stmt.failMsgExpr = modifiedExpr;

                return new TirFailExpr(
                    modifiedExpr,
                    ctx.returnType,
                    stmt.range
                );
            }
            else return new TirFailExpr( undefined, ctx.returnType, stmt.range );
        }
        else if( stmt instanceof TirAssertStmt ) {
            const condition = expressifyVars( ctx, stmt.condition );
            stmt.condition = condition;

            if( stmt.elseExpr ) {
                const elseExpr = expressifyVars( ctx, stmt.elseExpr );
                stmt.elseExpr = elseExpr;
            }

            assertions.push( stmt );
            continue;
        }
        else if( stmt instanceof TirIfStmt ) {
            if( stmt.thenBranch.definitelyTerminates() ) {
                const elseBranchStmts: TirStmt[] = [];
                if( stmt.elseBranch ) {
                    if( stmt.elseBranch instanceof TirBlockStmt ) {
                        elseBranchStmts.push( ...stmt.elseBranch.stmts );
                    }
                    else {
                        elseBranchStmts.push( stmt.elseBranch );
                    }
                }

                // move the rest of the body into the else branch
                elseBranchStmts.push(
                    ...bodyStmts
                );

                stmt.elseBranch = new TirBlockStmt(
                    elseBranchStmts,
                    stmt.elseBranch?.range ?? stmt.thenBranch.range
                );
            }
        }
        else if( stmt instanceof TirMatchStmt ) {

        }
        else if( stmt instanceof TirForStmt ) {

        }
        else if( stmt instanceof TirForOfStmt ) {

        }
        else if( stmt instanceof TirWhileStmt ) {

        }
        else {
            const tsEnsureExsautstiveCheck: never = stmt;
            console.error( stmt );
            throw new Error("unreachable::expressify::stmt");
        }
    }

    return new TirLitVoidExpr( SourceRange.mock );
}



function getConstrDestructPattern(
    type: TirSoPStructType,
    range: SourceRange,
    initExpr: TirExpr | undefined,
    constrIndex: number
): TirNamedDeconstructVarDecl
{
    const constr = type.constructors[constrIndex];
    if( !constr ) throw new Error("no constructor in single constr struct type");

    const deconstructedFields: Map<string, TirSimpleVarDecl> = new Map();
    for( const field of constr.fields ) {
        const uniqueName = getUniqueInternalName( field.name );
        deconstructedFields.set(
            field.name,
            new TirSimpleVarDecl(
                uniqueName,
                field.type,
                initExpr,
                false, // not a constant (reassigned if deconstruction statement already exists later)
                range
            )
        );
    }

    return new TirNamedDeconstructVarDecl(
        constr.name,
        deconstructedFields,
        undefined,
        type,
        undefined,
        false, // not a constant
        range
    );
}


function getNestedDestructsInSingleSopDestructPattern(
    pattern: TirNamedDeconstructVarDecl
): TirNamedDeconstructVarDecl[]
{
    const result : TirNamedDeconstructVarDecl[] = [];
    for( const [ fName, varDecl ] of pattern.fields )
    {
        if(!( varDecl instanceof TirSimpleVarDecl ))
        throw new Error("expected simple var decl in single destruct pattern");

        if(!( varDecl.type instanceof TirSoPStructType )) continue;

        result.push(
            getConstrDestructPattern(
                varDecl.type,
                varDecl.range,
                // init expr
                new TirVariableAccessExpr(
                    {
                        variableInfos: {
                            name: varDecl.name,
                            type: varDecl.type,
                            isConstant: true,
                        },
                        isDefinedOutsideFuncScope: false,
                    },
                    varDecl.range
                ),
                0
            )
        );
    }
    return result;
}

