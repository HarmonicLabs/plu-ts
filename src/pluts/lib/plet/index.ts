import type { PType } from "../../PType";
import type { PAlias } from "../../PTypes/PAlias/palias";
import type { TermAlias } from "../std/UtilityTerms/TermAlias";
import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { Term } from "../../Term";
import { PrimType } from "../../../type_system/types";
import { _fromData } from "../std/data/conversion/fromData_minimal";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { isClosedIRTerm } from "../../../IR/utils/isClosedIRTerm";
import { UtilityTermOf, addUtilityForType } from "../std/UtilityTerms/addUtilityForType";
import { makeMockUtilityTerm } from "../std/UtilityTerms/mockUtilityTerms/makeMockUtilityTerm";
import { getCallStackAt } from "../../../utils/getCallStackAt";
import { IRTerm } from "../../../IR/IRTerm";
import { termTypeToString } from "../../../type_system";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";

export type LettedTerm<PVarT extends PType, SomeExtension extends object> =
    Term<PVarT> & SomeExtension extends Term<PAlias<PVarT, {}>> ?
        TermAlias<PVarT, {}> & SomeExtension & {
            in: <PExprResult extends PType>( expr: (value: TermAlias<PVarT, {}> & SomeExtension) => Term<PExprResult> ) => UtilityTermOf<PExprResult>
        } :
        UtilityTermOf<PVarT> & {
            in: <PExprResult extends PType>( expr: (value: UtilityTermOf<PVarT>) => Term<PExprResult> ) => UtilityTermOf<PExprResult>
        }

export function plet<PVarT extends PType, SomeExtension extends object>(
    varValue: Term<PVarT> & SomeExtension,
    value_name?: string | undefined
): LettedTerm<PVarT, SomeExtension>
{
    type TermPVar = Term<PVarT> & SomeExtension;

    // unwrap 'asData' if is the case
    varValue = (varValue.type[0] === PrimType.AsData ? _fromData( varValue.type[1] )( varValue as any ) : varValue) as any;

    const type = varValue.type;

    const valueNameIsPresent = typeof value_name === "string";
    value_name = valueNameIsPresent ? value_name : undefined;

    const callStackSite = getCallStackAt( 3, {
        tryGetNameAsync: valueNameIsPresent,
        onNameInferred: valueNameIsPresent ? void 0 : inferred => value_name = inferred
    });

    let __src__ = callStackSite?.__line__;

    value_name = value_name ?? callStackSite?.inferredName;

    const letted = new Term(
        type,
        (cfg, dbn) => {
            const ir =  varValue.toIR( cfg, dbn );

            // `compileIRToUPLC` can handle it even if this check is not present
            // but why spend useful tree iterations if we can avoid them here?
            if(
                ir instanceof IRLetted || 
                ir instanceof IRHoisted || 
                ir instanceof IRVar ||
                ir instanceof IRSelfCall
            )
            {
                return ir;
            }

            if( isClosedIRTerm( ir ) )
            {
                return new IRHoisted( ir );
            }

            const res = new IRLetted(
                Number( dbn ),
                ir,
                { __src__, name: value_name }
            ); 

            return res;
        }
    );

    const withUtility = addUtilityForType( varValue.type );
    
    const continuation = <PExprResult extends PType>( expr: (value: TermPVar) => Term<PExprResult> ): UtilityTermOf<PExprResult> => {

        // only to extracts the type; never compiled
        const outType = expr( makeMockUtilityTerm( varValue.type ) as any ).type;

        // return papp( plam( varValue.type, outType )( expr as any ), varValue as any ) as any;
        const term = new Term(
            outType,
            (cfg, dbn) => {

                const arg = varValue.toIR( cfg, dbn );

                if(
                    // inline variables; no need to add an application since already in scope
                    arg instanceof IRVar ||
                    arg instanceof IRSelfCall
                )
                {
                    return expr( withUtility( varValue as any ) as any ).toIR( cfg, dbn );
                }

                // if(
                //     // inline letted terms; no need to add an application since already letted
                //     arg instanceof IRLetted
                // )
                // {
                //     return expr( withUtility( varValue as any ) as any ).toIR( cfg, dbn );
                // }

                return new IRApp(
                    new IRFunc(
                        1,
                        expr(
                            withUtility(
                                new Term(
                                    varValue.type,
                                    ( cfg, varAccessDbn) => new IRVar( varAccessDbn - ( dbn + BigInt(1) ) ) // point to the lambda generated here
                                ) as any
                            ) as any
                        ).toIR( cfg, ( dbn + BigInt(1) ) )
                    ),
                    arg,
                    { __src__ }
                )
            }
        );

        return addUtilityForType( outType )( term ) as UtilityTermOf<PExprResult>;
    }
    
    const lettedUtility = addUtilityForType( type )( letted );

    Object.defineProperty(
        lettedUtility, "in", {
            value: continuation,
            writable: false,
            enumerable: false,
            configurable: false
        }
    );

    return lettedUtility as any;
}