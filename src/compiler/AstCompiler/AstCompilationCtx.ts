import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { TirType } from "../tir/types/TirType";
import { Scope, ScopeInfos } from "./scope/Scope";


export interface AstCompilationCtxFuncInfo {
    /** present where the function definition is inside
     * an other funciton definiton (closure)
     * 
     * in which case, only constants from the parent funciton can be used
    **/
    parentFunctionCtx: AstCompilationCtxFuncInfo | undefined;
    returnHints: {
        type: TirType | undefined;
        isInferred: boolean;
    };
    /** to check for recursive functions while inferring return type */
    funcName: string;
}

export interface IAstCompilationCtx {
    scope: Scope;
    /** present if the statement is in a function body */
    functionCtx: AstCompilationCtxFuncInfo | undefined;
    /** to check if `continue` and `break` are valid in this context */
    isLoop: boolean;
}

export class AstCompilationCtx extends DiagnosticEmitter
    implements IAstCompilationCtx
{
    constructor(
        readonly scope: Scope,
        readonly functionCtx: AstCompilationCtxFuncInfo | undefined,
        readonly isLoop: boolean,
        public diagnostics: DiagnosticMessage[]
    ) {
        super( diagnostics );
    }

    newChildScope(
        childScopeInfos: ScopeInfos,
        isLoop: boolean
    ): AstCompilationCtx
    {
        return new AstCompilationCtx(
            this.scope.newChildScope( childScopeInfos ),
            this.functionCtx,
            isLoop,
            this.diagnostics
        );
    }

    newFunctionChildScope( funcName: string ): AstCompilationCtx
    {
        return new AstCompilationCtx(
            this.scope.newChildScope({
                ...this.scope.infos,
                isFunctionDeclScope: true
            }),
            { // function ctx
                funcName,
                parentFunctionCtx: this.functionCtx,
                returnHints: {
                    type: undefined,
                    isInferred: false
                }
            },
            false, // isLoop
            this.diagnostics
        );
    }

    newBranchChildScope(): AstCompilationCtx
    {
        // same as this, just new block
        return this.newChildScope(
            { ...this.scope.infos },
            this.isLoop
        );
    }

    newLoopChildScope(): AstCompilationCtx
    {
        return this.newChildScope(
            { ...this.scope.infos },
            true
        );
    }

    static fromScopeOnly( scope: Scope, diagnostics: DiagnosticMessage[] ): AstCompilationCtx
    {
        return new AstCompilationCtx(
            scope,
            undefined,
            false,
            diagnostics
        );
    }
}
