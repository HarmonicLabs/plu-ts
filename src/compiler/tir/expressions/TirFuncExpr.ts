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
        readonly typeParams: TirTypeParam[],
        // deconstructions are inlined in the body
        readonly params: TirSimpleVarDecl[],
        // initialized to symbol while inferring
        public returnType: TirType,
        // in case of lambdas (that only specify a return expression)
        // this is just a return statement wrapped in a block
        // (with decosntructed arguments if any) 
        readonly body: TirBlockStmt,
        readonly range: SourceRange
    ) {}

    isGeneric(): boolean
    {
        return this.typeParams.length > 0;
    }

    isAnonymous(): boolean
    {
        return this.name === "";
    }
}
