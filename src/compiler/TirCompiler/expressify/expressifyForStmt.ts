import { Identifier } from "../../../ast/nodes/common/Identifier";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { getUniqueInternalName } from "../../internalVar";
import { TirLitNamedObjExpr } from "../../tir/expressions/litteral/TirLitNamedObjExpr";
import { TirCallExpr } from "../../tir/expressions/TirCallExpr";
import { TirExpr } from "../../tir/expressions/TirExpr";
import { TirFuncExpr } from "../../tir/expressions/TirFuncExpr";
import { TirVariableAccessExpr } from "../../tir/expressions/TirVariableAccessExpr";
import { TirBlockStmt } from "../../tir/statements/TirBlockStmt";
import { TirBreakStmt } from "../../tir/statements/TirBreakStmt";
import { TirContinueStmt } from "../../tir/statements/TirContinueStmt";
import { TirForStmt } from "../../tir/statements/TirForStmt";
import { TirIfStmt } from "../../tir/statements/TirIfStmt";
import { TirReturnStmt } from "../../tir/statements/TirReturnStmt";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirWhileStmt } from "../../tir/statements/TirWhileStmt";
import { TirFuncT } from "../../tir/types/TirNativeType";
import { TirSoPStructType } from "../../tir/types/TirStructType";
import { ReassignedVariablesAndFlowInfos } from "./determineReassignedVariablesAndReturn";
import { expressifyFuncBody, LoopReplacements } from "./expressify";
import { ExpressifyCtx, isExpressifyFuncParam } from "./ExpressifyCtx";

export function whileToFor( stmt: TirWhileStmt | TirForStmt ): TirForStmt
{
    if(  stmt instanceof TirForStmt ) return stmt;

    // convert while to for
    return new TirForStmt(
        [], // no init
        stmt.condition, // condition
        [], // no update
        stmt.body, // loopBody
        stmt.range, // range
    );
}

export function expressifyForStmt(
    ctx: ExpressifyCtx,
    stmt: TirForStmt,
    returnType: TirSoPStructType,
    bodyStateType: TirSoPStructType,
    initState: TirLitNamedObjExpr,
): TirCallExpr
{
    const loopBody = stmt.body instanceof TirBlockStmt ? stmt.body : new TirBlockStmt( [ stmt.body ], stmt.range );

    if( stmt.condition )
    loopBody.stmts.unshift(
        new TirIfStmt(
            stmt.condition,
            // then
            loopBody,
            // else
            new TirBlockStmt([ new TirBreakStmt( stmt.condition.range ) ], stmt.condition.range ),
            stmt.condition.range
        )
    );

    loopBody.stmts.push(
        new TirContinueStmt( loopBody.range.atEnd() )
    );

    const loopFuncName = getUniqueInternalName("loop");

    const loopFuncType = new TirFuncT(
        bodyStateType.constructors[0].fields.map( f => f.type ),
        returnType
    );

    const loopReplacements: LoopReplacements = {
        compileBreak( ctx, stmt ) {
            // return first constructor of the return type
            const ctor = returnType.constructors[0];
            return new TirLitNamedObjExpr(
                new Identifier( ctor.name, stmt.range ),
                ctor.fields.map( f => new Identifier( f.name, stmt.range ) ),
                bodyStateType.constructors[0].fields
                .slice(0, ctor.fields.length)
                .map( f => {
                    const resolved = ctx.getVariable( f.name );
                    if( isExpressifyFuncParam( resolved ) ) {
                        return new TirVariableAccessExpr(
                            {
                                variableInfos: {
                                    name: resolved.name,
                                    type: resolved.type,
                                    isConstant: false
                                },
                                isDefinedOutsideFuncScope: false
                            },
                            stmt.range
                        )
                    }
                    return resolved;
                }),
                returnType,
                stmt.range
            )
        },
        replaceReturnValue( ctx, stmt ) {
            // return second constructor of the return type
            const ctor = returnType.constructors[1];
            if( !ctor ) {
                throw new Error("No return constructor found in return type");
            }
            return new TirLitNamedObjExpr(
                new Identifier( ctor.name, stmt.range ),
                [ new Identifier( ctor.fields[0].name, stmt.range ) ],
                [ stmt.value ],
                returnType,
                stmt.range
            );
        },
        compileContinue( ctx, stmt ) {
            // return recursive call
            const resolvedSelfResult = ctx.getVariable( loopFuncName );
            let resolvedSelf: TirExpr;
            if( isExpressifyFuncParam( resolvedSelfResult ) ) {
                resolvedSelf = new TirVariableAccessExpr(
                    {
                        variableInfos: {
                            name: resolvedSelfResult.name,
                            type: resolvedSelfResult.type,
                            isConstant: false
                        },
                        isDefinedOutsideFuncScope: false
                    },
                    stmt.range
                );
            } else {
                resolvedSelf = resolvedSelfResult;
            }
            return new TirCallExpr(
                resolvedSelf,
                bodyStateType.constructors[0].fields
                .map( f => {
                    const resolved = ctx.getVariable( f.name );
                    if( isExpressifyFuncParam( resolved ) ) {
                        return new TirVariableAccessExpr(
                            {
                                variableInfos: {
                                    name: resolved.name,
                                    type: resolved.type,
                                    isConstant: false
                                },
                                isDefinedOutsideFuncScope: false
                            },
                            stmt.range
                        )
                    }
                    return resolved;
                }),
                returnType,
                stmt.range
            );
        },
    };

    const loopCompilationCtx = ctx.newChild();

    // define loop function for recursion
    loopCompilationCtx.setFuncParam( loopFuncName, loopFuncType );

    // define loop function parameters
    for( const { name, type } of bodyStateType.constructors[0].fields )
    {
        loopCompilationCtx.setFuncParam( name, type );
    }

    return new TirCallExpr(
        new TirFuncExpr(
            loopFuncName,
            bodyStateType.constructors[0].fields.map( f => {

                return new TirSimpleVarDecl(
                    f.name,
                    f.type,
                    undefined, // no initial value
                    false, // is constant
                    stmt.range
                )
            }),
            returnType,
            new TirBlockStmt([
                new TirReturnStmt(
                    expressifyFuncBody(
                        loopCompilationCtx,
                        loopBody.stmts,
                        loopReplacements,
                        [], // assertions
                    ),
                    stmt.range
                )
            ], stmt.range
            ),
            stmt.range
        ),
        initState.values,
        returnType,
        stmt.range
    );
}