import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { AstCompilationCtx } from "../../AstCompilationCtx";

export function _hasDuplicateTypeParams( ctx: AstCompilationCtx, typeParams: Identifier[] ): boolean
{
    const typeParamNames = new Set<string>();
    let result = false;
    for( const tp of typeParams )
    {
        if( typeParamNames.has( tp.text ) )
        {
            ctx.error(
                DiagnosticCode.Duplicate_identifier_0,
                tp.range, tp.text
            );
            result = true;
        }
        typeParamNames.add( tp.text );
    }
    return result;
}