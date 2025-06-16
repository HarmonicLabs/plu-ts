import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirExpr } from "./ITirExpr";
import { TirSimpleVarDecl } from "../statements/TirVarDecl/TirSimpleVarDecl";
import { TirType } from "../types/TirType";
import { TirBlockStmt } from "../statements/TirBlockStmt";
import { TirFuncT } from "../types/TirNativeType";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";

export class TirFuncExpr
    implements ITirExpr
{ 
    get type(): TirFuncT
    {
        return this.sig();
    }
    sig(): TirFuncT
    {
        return new TirFuncT(
            this.params.map( p => p.type ),
            this.returnType
        );
    }
    constructor(
        readonly name: string,
        // deconstructions are inlined in the body
        readonly params: TirSimpleVarDecl[],
        // initialized to symbol while inferring
        public returnType: TirType,
        // in case of lambdas (that only specifies a return expression)
        // this is just a return statement wrapped in a block
        // (with decosntructed arguments if any) 
        readonly body: TirBlockStmt,
        readonly range: SourceRange,
        private readonly _isLoop: boolean = false,
    ) {}

    /**
     * `true` if the function is guaranteed to never error
     */
    readonly isSafe: boolean = false;
    /**
     * `true` if, for all cases where the function can error,
     * there is an alternative implementation that is safe (wrapping the result as `Optional`)
     */
    readonly isRecoverable: boolean = false;

    isAnonymous(): boolean
    {
        return this.name === "";
    }
    
    private _deps: string[] | undefined = undefined;
    private _defineDeps(): void
    {
        if( Array.isArray( this._deps ) ) return;

        const { introducedVars, deps } = this.params.reduce(( acc, param ) => {
            mergeSortedStrArrInplace(
                acc.deps,
                filterSortedStrArrInplace(
                    param.deps(),
                    acc.introducedVars
                )
            );
            mergeSortedStrArrInplace( acc.introducedVars, param.introducedVars() );
            return acc;
        }, { introducedVars: [], deps: [] });

        mergeSortedStrArrInplace( deps, this.body.deps() );
        filterSortedStrArrInplace( deps, introducedVars );

        this._deps = deps;
    }
    deps(): string[]
    {
        this._defineDeps();
        return this._deps!.slice();
    }

    isRecursive(): boolean
    {
        if( this._isLoop ) return true;
        this._defineDeps();
        return this._deps!.includes( this.name );
    }
}
