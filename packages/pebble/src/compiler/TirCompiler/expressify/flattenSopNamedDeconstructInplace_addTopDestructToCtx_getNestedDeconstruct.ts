import { getUniqueInternalName } from "../../internalVar";
import { TirVariableAccessExpr } from "../../tir/expressions/TirVariableAccessExpr";
import { TirNamedDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirVarDecl } from "../../tir/statements/TirVarDecl/TirVarDecl";
import { TirDataStructType, TirSoPStructType } from "../../tir/types/TirStructType";
import { getUnaliased } from "../../tir/types/utils/getUnaliased";
import { ExpressifyCtx } from "./ExpressifyCtx";
import { isSingleConstrStruct } from "./isSingleConstrStruct";

/**
 * 
 * @returns the extracted nested deconstructions
 */
export function flattenSopNamedDeconstructInplace_addTopDestructToCtx_getNestedDeconstruct(
    decl: TirNamedDeconstructVarDecl | TirSingleDeconstructVarDecl,
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
            ctx.setNewVariableName( fName, varDecl.name ); // added to fix reassigned variables on non-terminating statements
            if( isSingleConstrStruct( varDecl.type ) )
            {
                const structType = getUnaliased( varDecl.type ) as (TirDataStructType | TirSoPStructType);
                const constr = structType.constructors[0];
                extracted.push(
                    new TirNamedDeconstructVarDecl(
                        constr.name,
                        new Map(
                            constr.fields.map( f => [
                                f.name,
                                new TirSimpleVarDecl(
                                    getUniqueInternalName( f.name ),
                                    f.type,
                                    undefined, // no init expr
                                    varDecl.isConst,
                                    varDecl.range
                                )
                            ])
                        ),
                        undefined, // no rest field
                        varDecl.type,
                        // init expr
                        new TirVariableAccessExpr(
                            {
                                variableInfos: {
                                    name: varDecl.name,
                                    type: varDecl.type,
                                    isConstant: varDecl.isConst,
                                },
                                isDefinedOutsideFuncScope: false,
                            },
                            varDecl.range
                        ),
                        varDecl.isConst,
                        varDecl.range,
                    )
                )
            }
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