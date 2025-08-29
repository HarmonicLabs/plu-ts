import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRCase, IRConst, IRDelayed, IRError, IRForced, IRFunc, IRNative, IRTerm, IRVar } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { _ir_let } from "../../../IR/tree_utils/_ir_let";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirArrayLikeDeconstr } from "../statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirDataOptT, TirSopOptT } from "../types/TirNativeType";
import { TirDataStructType, TirSoPStructType } from "../types/TirStructType";
import { TirType } from "../types/TirType";
import { getOptTypeArg } from "../types/utils/getOptTypeArg";
import { getUnaliased } from "../types/utils/getUnaliased";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { _inlineFromData } from "./TirFromDataExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirCaseExpr
    implements ITirExpr
{
    constructor(
        public matchExpr: TirExpr,
        readonly cases: TirCaseMatcher[],
        readonly wildcardCase: TirWildcardCaseMatcher | undefined,
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    /// @ts-ignore Return type annotation circularly references itself.
    clone(): TirCaseExpr
    {
        return new TirCaseExpr(
            this.matchExpr.clone(),
            this.cases.map( c => new TirCaseMatcher(
                c.pattern, c.body.clone(), c.range.clone()
            )),
            this.wildcardCase ? new TirWildcardCaseMatcher(
                this.wildcardCase.body.clone(),
                this.wildcardCase.range.clone()
            ) : undefined,
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[]
    {
        const deps: string[] = this.matchExpr.deps();
        for( const matcher of this.cases ) {
            mergeSortedStrArrInplace( deps, matcher.deps() );
        }
        if( this.wildcardCase ) mergeSortedStrArrInplace( deps, this.wildcardCase.deps() );
        return deps;
    }

    get isConstant(): boolean { return false }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const matchExprType = getUnaliased( this.matchExpr.type );
        if(
            matchExprType instanceof TirSoPStructType
            || matchExprType instanceof TirSopOptT
        ) return this._sopStructToIR( matchExprType, ctx );

        if(
            matchExprType instanceof TirDataStructType
            || matchExprType instanceof TirDataOptT
        ) return this._dataStructToIR( matchExprType, ctx );

        throw new Error(
            "`case` expressions are only supported on Sum-of-Products or Data Struct types; got: "
            + this.matchExpr.type.toString()
        );
    }

    private _sopStructToIR(
        matchExprType: TirSoPStructType | TirSopOptT,
        ctx: ToIRTermCtx
    ): IRTerm
    {
        if( matchExprType instanceof TirSopOptT )
        {
            const wildcardBodyIR = this.wildcardCase?.body.toIR( ctx ) ?? new IRError();

            const someBranchCtx = ctx.newChild();
            const someBranch = this.cases.find(
                c => c.pattern.constrName === "Some"
            );
            if( someBranch ) {
                const varDecl = someBranch.pattern.fields.values().next().value;
                if(!( varDecl instanceof TirSimpleVarDecl ))
                throw new Error("case pattern not expressified.");
                someBranchCtx.defineVar( varDecl.name );
            }
            const someBranchIR = someBranch?.body.toIR( someBranchCtx ) ?? wildcardBodyIR;

            const noneBranchIR = this.cases.find(
                c => c.pattern.constrName === "None"
            )?.body.toIR( ctx ) ?? wildcardBodyIR;

            return new IRCase(
                this.matchExpr.toIR( ctx ), [
                    // Some{ value }
                    new IRFunc( 1, someBranchIR ),
                    // None
                    noneBranchIR
                ]
            );
        }

        // TirSopStructType
        const wildcardBodyIR = this.wildcardCase?.body.toIR( ctx ) ?? new IRError();
        const branches: IRTerm[] = matchExprType.constructors.map(
            ctor => {
                const wrapBody = ctor.fields.length === 0
                    ? ( body: IRTerm ) => body
                    : ( body: IRTerm ) => new IRFunc( ctor.fields.length, body );

                const branchCtx = ctx.newChild();
                const branch = this.cases.find(
                    c => c.pattern.constrName === ctor.name
                );
                if( !branch ) return wrapBody( wildcardBodyIR );

                const pattern = branch.pattern;
                for( const field of ctor.fields ) {
                    const varDecl = pattern.fields.get( field.name );
                    if( !varDecl ) {
                        // increment debrujin
                        // variable is still introduced, even if unused
                        branchCtx.pushUnusedVar();
                        continue;
                    }
                    if(!(varDecl instanceof TirSimpleVarDecl ))
                    throw new Error("case pattern not expressified.");

                    branchCtx.defineVar( varDecl.name );
                }

                return wrapBody(
                    branch.body.toIR( branchCtx )
                );
            }
        );

        // branches at the end that are supposed to "just fail"
        // can be omitted, as the CEK machine will fail if no branch for
        // a given constructor is found
        while(
            branches[ branches.length - 1 ] instanceof IRError
        ) branches.pop();

        return branches.length > 0 ? new IRCase(
            this.matchExpr.toIR( ctx ),
            branches
        ) : new IRError() ; // all branches fail, so the whole expression fails
    }

    // TODO: optimization
    // expect data-encoded patterns to be empty after `expressify`
    // because accessed field should use `IRLetted` instead
    private _dataStructToIR(
        matchExprType: TirDataStructType | TirDataOptT,
        ctx: ToIRTermCtx
    ): IRTerm
    {
        if( matchExprType instanceof TirDataOptT )
        {
            const stmtCtx = ctx.newChild();
            stmtCtx.pushUnusedVar(); // debrujin un constr data result

            const wildcardBodyIR = this.wildcardCase?.body.toIR( stmtCtx ) ?? new IRError();

            const someBranchCtx = stmtCtx.newChild();
            const someBranch = this.cases.find(
                c => c.pattern.constrName === "Some"
            );
            if( someBranch ) {
                const varDecl = someBranch.pattern.fields.values().next().value;
                if( varDecl === undefined ) {
                    // increment debrujin
                    // variable is still introduced, even if unused
                    someBranchCtx.pushUnusedVar();
                }
                else {
                    if(!( varDecl instanceof TirSimpleVarDecl ))
                    throw new Error("case pattern not expressified.");
                    someBranchCtx.defineVar( varDecl.name );
                }
            }
            const someBranchIR = someBranch?.body.toIR( someBranchCtx ); // ?? wildcardBodyIR;

            const noneBranchIR = this.cases.find(
                c => c.pattern.constrName === "None"
            )?.body.toIR( stmtCtx ) ?? wildcardBodyIR;

            if( someBranchIR instanceof IRError && noneBranchIR instanceof IRError )
            return new IRError();

            return new IRForced(
                _ir_let(
                    _ir_apps(
                        IRNative.unConstrData,
                        this.matchExpr.toIR( ctx )
                    ),
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        _ir_apps(
                            IRNative.equalsInteger,
                            IRConst.int( 0 ),
                            _ir_apps(
                                IRNative.fstPair,
                                new IRVar( 0 ) // unConstrData result
                            )
                        ),
                        // then Just{ value }
                        !someBranchIR ? new IRDelayed( wildcardBodyIR ) :
                        _ir_let(
                            _inlineFromData(
                                getOptTypeArg( matchExprType )!,
                                _ir_apps(
                                    IRNative.sndPair,
                                    new IRVar( 0 ) // unConstrData result
                                )
                            ),
                            new IRDelayed( someBranchIR )
                        ),
                        // else None
                        new IRDelayed( noneBranchIR )
                    )
                )
            );
        }

        // TirDataStructType

        const stmtCtx = ctx.newChild();
        stmtCtx.pushUnusedVar(); // unconstrStruct
        stmtCtx.pushUnusedVar(); // isConstrIdx

        const noVarsWildcardBodyIR = (
            this.wildcardCase?.body.toIR( stmtCtx )
            ?? new IRError()
        );
        const delayedNoVarWildcardBodyIR = new IRDelayed( noVarsWildcardBodyIR );
        let ifThenElseMatchingStatements: IRTerm = noVarsWildcardBodyIR;

        if(
            this.cases.some(({ pattern }) =>
                matchExprType.constructors.findIndex( ctor => ctor.name === pattern.constrName ) < 0
            )
        ) throw new Error("case expression includes unknown constructor.");

        const cases = this.cases.sort((a, b) => {
            const a_idx = matchExprType.constructors.findIndex( ctor => ctor.name === a.pattern.constrName );
            const b_idx = matchExprType.constructors.findIndex( ctor => ctor.name === b.pattern.constrName );
            return a_idx - b_idx;
        });

        for( let i = cases.length - 1; i >= 0; i-- )
        {
            const { pattern, body } = cases[i];
            const ctorIdx = matchExprType.constructors.findIndex( ctor => ctor.name === pattern.constrName );
            if( ctorIdx < 0 ) throw new Error("case expression includes unknown constructor."); // unreachable

            const ctor = matchExprType.constructors[ ctorIdx ];
            const usedFieldsCtorNames = (
                ctor.fields.map( f => f.name )
                .filter( fName => pattern.fields.has( fName ) )
            );

            if( usedFieldsCtorNames.length <= 0 ) {
                ifThenElseMatchingStatements = _ir_apps(
                    IRNative.strictIfThenElse,
                    _ir_apps(
                        new IRVar( 0 ), // isConstrIdx
                        IRConst.int( ctorIdx )
                    ),
                    // then
                    new IRDelayed(
                        body.toIR( stmtCtx )
                    ),
                    // else
                    new IRDelayed( ifThenElseMatchingStatements )
                );
                continue;
            }

            function indexOfField( fieldName: string ): number
            {
                const idx = ctor.fields.findIndex( f => f.name === fieldName );
                if( idx < 0 ) throw new Error("case pattern not expressified.");
                return idx;
            }

            if( usedFieldsCtorNames.length === 1 ) {
                const thenCtx = stmtCtx.newChild();

                const fName = usedFieldsCtorNames[0];

                const patternVarDecl = pattern.fields.get( fName );
                if(!( patternVarDecl instanceof TirSimpleVarDecl ))
                throw new Error("case pattern not expressified.");
                thenCtx.defineVar( patternVarDecl.name );

                const thenCase = _ir_let(
                    _inlineFromData(
                        patternVarDecl.type,
                        _ir_apps(
                            IRNative.headList,
                            _ir_apps(
                                IRNative._dropList,
                                IRConst.int( indexOfField( fName ) ), // constr field index
                                _ir_apps( // fileds as data list
                                    IRNative.sndPair,
                                    new IRVar( 1 ) // uncostrStruct
                                )
                            )
                        )
                    ),
                    body.toIR( thenCtx )
                );
                ifThenElseMatchingStatements = _ir_apps(
                    IRNative.strictIfThenElse,
                    _ir_apps(
                        new IRVar( 0 ), // isConstrIdx
                        IRConst.int( ctorIdx )
                    ),
                    // then
                    new IRDelayed( thenCase ),
                    // else
                    new IRDelayed( ifThenElseMatchingStatements )
                );
                continue;
            }

            // multiple fields used
            const thenCtx = stmtCtx.newChild();
            const sortedUsedFields = [ ...usedFieldsCtorNames ].sort((a, b) =>
                indexOfField( a ) - indexOfField( b )
            );

            for( const fName of sortedUsedFields ) {
                const patternVarDecl = pattern.fields.get( fName );
                if(!( patternVarDecl instanceof TirSimpleVarDecl ))
                throw new Error("case pattern not expressified.");
                thenCtx.defineVar( patternVarDecl.name );
            }

            const extractedFields: IRTerm[] = sortedUsedFields.map( fName =>
                _inlineFromData(
                    ctor.fields.find( f => f.name === fName )!.type,
                    _ir_apps(
                        IRNative.headList,
                        _ir_apps(
                            IRNative._dropList,
                            IRConst.int( indexOfField( fName ) ), // constr field index
                            new IRVar( 0 ) // fileds as data list
                        )
                    )
                )
            );
            const thenCase = _ir_let(
                _ir_apps(
                    IRNative.sndPair,
                    new IRVar( 1 ) // uncostrStruct
                ), // fileds as data list
                _ir_apps(
                    new IRFunc(
                        sortedUsedFields.length,
                        body.toIR( thenCtx )
                    ),
                    ...(extractedFields as [IRTerm, IRTerm, ...IRTerm[]])
                )
            );
            ifThenElseMatchingStatements = _ir_apps(
                IRNative.strictIfThenElse,
                _ir_apps(
                    new IRVar( 0 ), // isConstrIdx
                    IRConst.int( ctorIdx )
                ),
                // then
                new IRDelayed( thenCase ),
                // else
                new IRDelayed( ifThenElseMatchingStatements )
            );
        }

        return new IRForced(
            _ir_let(
                _ir_apps(
                    IRNative.unConstrData,
                    this.matchExpr.toIR( ctx )
                ), // uncostrStruct
                _ir_let(
                    _ir_apps(
                        IRNative.equalsInteger,
                        _ir_apps(
                            IRNative.fstPair,
                            new IRVar( 0 ) // unConstrData result
                        )
                    ), // isConstrIdx
                    ifThenElseMatchingStatements
                )
            )
        );
    }
}

export type TirCasePattern
    = TirNamedDeconstructVarDecl
    // | TirSingleDeconstructVarDecl
    // | TirArrayLikeDeconstr
    ;

export class TirCaseMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirCasePattern,
        public body: TirExpr,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        const nonDeps = this.pattern.introducedVars();
        const deps: string[] = this.body.deps();
        filterSortedStrArrInplace( deps, nonDeps );
        return deps;
    }
}

export class TirWildcardCaseMatcher
    implements HasSourceRange
{
    constructor(
        public body: TirExpr,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.body.deps();
    }
}