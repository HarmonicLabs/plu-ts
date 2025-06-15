import { Identifier } from "../../../ast/nodes/common/Identifier";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { keepSortedStrArrInplace } from "../../../utils/array/keepSortedArrInplace";
import { getUniqueInternalName } from "../../internalVar";
import { TirLitNamedObjExpr } from "../../tir/expressions/litteral/TirLitNamedObjExpr";
import { TirExpr } from "../../tir/expressions/TirExpr";
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
import { ITirStmt, TirStmt } from "../../tir/statements/TirStmt";
import { TirNamedDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { isTirVarDecl } from "../../tir/statements/TirVarDecl/TirVarDecl";
import { TirWhileStmt } from "../../tir/statements/TirWhileStmt";
import { TirSoPStructType, TirStructConstr, TirStructField } from "../../tir/types/TirStructType";
import { ExpressifyCtx, isExpressifyFuncParam } from "./ExpressifyCtx";

export interface ReassignedVariablesAndReturn {
    reassigned: string[];
    returns: boolean;
}

export interface ReassignedVariablesAndFlowInfos extends ReassignedVariablesAndReturn {
    canContinue: boolean;
    canBreak: boolean;
}

export function determineReassignedVariablesAndReturn(
    stmt: TirStmt 
): ReassignedVariablesAndReturn
{
    const originalStmtDeps = stmt.deps();
    const stack: TirStmt[] = [ stmt ];

    const reassignedSet: Set<string> = new Set();
    let returns = false;

    while( stmt = stack.pop()! )
    {
        if(
            stmt instanceof TirFailStmt
            || isTirVarDecl( stmt )
            || stmt instanceof TirBreakStmt
            || stmt instanceof TirContinueStmt
            || stmt instanceof TirAssertStmt
        ) continue;

        if( stmt instanceof TirReturnStmt ) {
            returns = true;
            continue;
        }

        if( stmt instanceof TirAssignmentStmt )
        {
            reassignedSet.add( stmt.varIdentifier.varName );
            continue;
        }
        
        if( stmt instanceof TirBlockStmt ) {
            stack.push( ...stmt.stmts );
            continue;
        }

        if( stmt instanceof TirIfStmt ) {
            stack.push( stmt.thenBranch );
            if( stmt.elseBranch ) stack.push( stmt.elseBranch );
            continue;
        }
        if( stmt instanceof TirMatchStmt ) {
            for( const caseStmt of stmt.cases ) {
                stack.push( caseStmt.body );
            }
            continue;
        }
        if( stmt instanceof TirForStmt )
        {
            stack.push( stmt.body );
            if( stmt.update ) stack.push( ...stmt.update );
            continue;
        }
        if(
            stmt instanceof TirForOfStmt
            || stmt instanceof TirWhileStmt
        ) {
            stack.push( stmt.body );
            continue;
        }

        const tsEnsureExsaustiveCheck: never = stmt;
    }

    let reassigned = [ ...reassignedSet ].sort();
    reassigned = keepSortedStrArrInplace( reassigned, originalStmtDeps );
    return {
        reassigned,
        returns
    };
}

export function determineReassignedVariablesAndFlowInfos(
    stmt: TirStmt 
): ReassignedVariablesAndFlowInfos
{
    const originalStmtDeps = stmt.deps();
    const stack: TirStmt[] = [ stmt ];

    const reassignedSet: Set<string> = new Set();
    let returns = false;
    let canBreak = false;
    let canContinue = false;

    while( stmt = stack.pop()! )
    {
        if(
            stmt instanceof TirFailStmt
            || isTirVarDecl( stmt )
            || stmt instanceof TirBreakStmt
            || stmt instanceof TirContinueStmt
            || stmt instanceof TirAssertStmt
        ) continue;

        if( stmt instanceof TirBreakStmt ) {
            canBreak = true;
            continue;
        }
        if( stmt instanceof TirContinueStmt ) {
            canContinue = true;
            continue;
        }

        if( stmt instanceof TirReturnStmt ) {
            returns = true;
            continue;
        }

        if( stmt instanceof TirAssignmentStmt )
        {
            reassignedSet.add( stmt.varIdentifier.varName );
            continue;
        }
        
        if( stmt instanceof TirBlockStmt ) {
            stack.push( ...stmt.stmts );
            continue;
        }

        if( stmt instanceof TirIfStmt ) {
            stack.push( stmt.thenBranch );
            if( stmt.elseBranch ) stack.push( stmt.elseBranch );
            continue;
        }
        if( stmt instanceof TirMatchStmt ) {
            for( const caseStmt of stmt.cases ) {
                stack.push( caseStmt.body );
            }
            continue;
        }

        // for loop statements
        // we are only intersted in eventual reassignments and returns
        // 
        // if conitnue or break statements are present there
        // they refer to the inner loop itself, not to this outer loop
        if( stmt instanceof TirForStmt )
        {
            const reassignedAndReturn = determineReassignedVariablesAndReturn( stmt.body );
            for( const varName of reassignedAndReturn.reassigned ) {
                reassignedSet.add( varName );
            }
            if( reassignedAndReturn.returns ) returns = true;
            if( stmt.update ) stack.push( ...stmt.update );
            continue;
        }
        if(
            stmt instanceof TirForOfStmt
            || stmt instanceof TirWhileStmt
        ) {
            const reassignedAndReturn = determineReassignedVariablesAndReturn( stmt.body );
            for( const varName of reassignedAndReturn.reassigned ) {
                reassignedSet.add( varName );
            }
            if( reassignedAndReturn.returns ) returns = true;
            continue;
        }

        const tsEnsureExsaustiveCheck: never = stmt;
    }

    let reassigned = [ ...reassignedSet ].sort();
    reassigned = keepSortedStrArrInplace( reassigned, originalStmtDeps );
    return {
        reassigned,
        returns,
        canBreak,
        canContinue
    };
}

export function definitelyFails( stmt: TirStmt | TirBlockStmt ): boolean
{
    const stack: (TirStmt | TirBlockStmt)[] = [ stmt ];
    while( stmt = stack.pop()! )
    {
        if( stmt instanceof TirFailStmt ) return true;

        if( stmt instanceof TirBlockStmt ) {
            stack.push( ...stmt.stmts );
            continue;
        }

        if( isTirVarDecl( stmt ) ) continue;
        if( stmt instanceof TirIfStmt ) {
            stack.push( stmt.thenBranch );
            if( stmt.elseBranch ) stack.push( stmt.elseBranch );
            continue;
        }
        if( stmt instanceof TirMatchStmt ) {
            if( stmt.cases.every(({ body }) => definitelyFails( body )) ) return true;
            continue;
        }
        if(
            stmt instanceof TirForStmt
            || stmt instanceof TirForOfStmt
            || stmt instanceof TirWhileStmt
        ) {
            stack.push( stmt.body );
            continue;
        }
        if(
            stmt instanceof TirReturnStmt
            || stmt instanceof TirBlockStmt
            || stmt instanceof TirBreakStmt
            || stmt instanceof TirContinueStmt
            || stmt instanceof TirAssertStmt
            || stmt instanceof TirAssignmentStmt
        ) continue;

        // const tsEnsureExsaustiveCheck: never = stmt;
    }

    return false;
}

export interface BranchStmtSopAndInitState {
    sop: TirSoPStructType;
    initState: TirLitNamedObjExpr;
}

export function getBranchStmtReturnType(
    { reassigned, returns }: ReassignedVariablesAndReturn,
    ctx: ExpressifyCtx,
    stmtRange: SourceRange
): BranchStmtSopAndInitState
{
    const uniqueName = getUniqueInternalName("__StmtSideEffects");
    const reassignsConstrName = "Reassigns";
    const earlyReturnConstrName = "EarlyReturn";

    const initVars = reassigned.map( varName => {
        const varExpr = ctx.getVariable( varName );
        if( isExpressifyFuncParam( varExpr ) )
        return new TirVariableAccessExpr(
            {
                variableInfos: {
                    name: varName,
                    type: varExpr.type,
                    isConstant: false
                },
                isDefinedOutsideFuncScope: false
            },
            stmtRange
        );
        return varExpr;
    });

    const constrs: TirStructConstr[] = [
        new TirStructConstr(
            reassignsConstrName,
            reassigned.map(( varName, i ) => new TirStructField(
                    varName,
                    initVars[i].type
                )
            )
        )
    ];
    if( returns ) {
        constrs.push(
            new TirStructConstr(
                earlyReturnConstrName,
                [
                    new TirStructField(
                        "returnValue",
                        ctx.returnType
                    )
                ]
            )
        );
    }
    const sop = new TirSoPStructType(
        uniqueName,
        "", // file uid 
        constrs,
        new Map(), // no methods
    );
    return {
        sop,
        initState: new TirLitNamedObjExpr(
            new Identifier( reassignsConstrName, stmtRange ),
            reassigned.map( varName => new Identifier( varName, stmtRange ) ),
            initVars,
            sop,
            stmtRange
        )
    };
}

export function getBodyStateType(
    { sop, initState }: BranchStmtSopAndInitState,
    stmt: TirForStmt
): {
    bodyStateType: TirSoPStructType,
    initState: TirLitNamedObjExpr,
}
{
    const bodyStateType = sop.clone();
    bodyStateType.constructors.length = 1; // keep only the first constructor
    const bodyStateConstr = bodyStateType.constructors[0];

    for( const { name, type, range, initExpr, isConst } of stmt.init )
    {
        if( !initExpr )
        throw new Error("loop init variable requires initialization expression");

        // TODO: optimize for `isConst`

        const uniqueFieldName = getUniqueInternalName( name );
        bodyStateConstr.fields.push(
            new TirStructField(
                uniqueFieldName,
                type
            )
        );
        initState.fieldNames.push( new Identifier( uniqueFieldName, range ) );
        initState.values.push( initExpr );
    }

    return {
        bodyStateType,
        initState,
    };
}