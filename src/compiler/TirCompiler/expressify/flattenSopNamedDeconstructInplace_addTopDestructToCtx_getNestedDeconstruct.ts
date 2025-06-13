import { getUniqueInternalName } from "../../internalVar";
import { TirVariableAccessExpr } from "../../tir/expressions/TirVariableAccessExpr";
import { TirNamedDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirVarDecl } from "../../tir/statements/TirVarDecl/TirVarDecl";
import { ExpressifyCtx } from "./ExpressifyCtx";

/**
 * 
 * @returns the extracted nested deconstructions
 */
export function flattenSopNamedDeconstructInplace_addTopDestructToCtx_getNestedDeconstruct(
    decl: TirNamedDeconstructVarDecl,
    ctx: ExpressifyCtx
): TirVarDecl[]
{
    const extracted: TirVarDecl[] = [];

    const restFields: Map<string, string> = new Map();
    for( const [ fName, varDecl ] of decl.fields )
    {
        if( varDecl instanceof TirSimpleVarDecl ) {
            restFields.set(
                fName,
                varDecl.name
            );
            ctx.introduceFuncParams([ varDecl ]);
            continue;
        }

        const newFieldUniqueName = getUniqueInternalName( fName );
        const fieldAsSimpleVarDecl = new TirSimpleVarDecl(
            newFieldUniqueName,
            varDecl.type,
            varDecl.initExpr,
            varDecl.isConst,
            varDecl.range
        );
        decl.fields.set(
            fName,
            fieldAsSimpleVarDecl
        );

        ctx.introduceFuncParams([ fieldAsSimpleVarDecl ]);
        restFields.set(
            fName,
            newFieldUniqueName
        );

        varDecl.initExpr = new TirVariableAccessExpr(
            {
                variableInfos: {
                    name: newFieldUniqueName,
                    type: varDecl.type,
                    isConstant: varDecl.isConst,
                },
                isDefinedOutsideFuncScope: false,
            },
            varDecl.range
        );
        extracted.push( varDecl );
    }

    if( decl.rest )
    {
        ctx.properties.set(
            decl.rest,
            restFields
        );
        // ctx.introduceFuncParams([ decl.rest ]);
    }

    return extracted;
}