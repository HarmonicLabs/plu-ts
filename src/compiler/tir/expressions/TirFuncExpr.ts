import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirExpr } from "./ITirExpr";
import { TirSimpleVarDecl } from "../statements/TirVarDecl/TirSimpleVarDecl";
import { TirType } from "../types/TirType";
import { TirBlockStmt } from "../statements/TirBlockStmt";
import { TirFuncT } from "../types/TirNativeType";
import { TirTypeParam } from "../types/TirTypeParam";

export class TirFuncExpr
    implements ITirExpr
{ 
    get type(): TirFuncT
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
        readonly range: SourceRange
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

    isGeneric(): boolean
    {
        return false;
        // return this.typeParams.length > 0;
    }

    isAnonymous(): boolean
    {
        return this.name === "";
    }

    signature(): TirFuncT
    {
        return this.type;
    }
}
