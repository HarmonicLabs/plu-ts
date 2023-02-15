import { Application } from "../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../UPLC/UPLCTerms/Builtin";
import { getNRequiredForces } from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../PType";
import { Term } from "../Term";
import { PrimType } from "../type_system";
import { addUtilityForType } from "./addUtilityForType";
import { fromData } from "./std";


export function plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> & SomeExtension )
{
    type TermPVar = Term<PVarT> & SomeExtension;

    // unwrap 'asData' if is the case
    varValue = (varValue.type[0] === PrimType.AsData ? fromData( varValue.type[1] )( varValue as any ) : varValue) as any;
    
    const continuation = <PExprResult extends PType>( expr: (value: TermPVar) => Term<PExprResult> ): Term<PExprResult> => {

        const withUtility = addUtilityForType( varValue.type );
        // only to extracts the type; never compiled
        const outType = expr(
            withUtility(
                new Term(
                    varValue.type,
                    _varAccessDbn => new UPLCVar( 0 ) // mock variable
                ) as any
            ) as any
        ).type;

        // return papp( plam( varValue.type, outType )( expr as any ), varValue as any ) as any;
        const term = new Term(
            outType,
            dbn => {
                const arg = varValue.toUPLC( dbn );

                if(
                    // inline variables; no need to add an application since already in scope
                    arg instanceof UPLCVar ||
                    (
                        // builtins with less than 2 forces do take less space inlined
                        // if it has two forces it is convenient to inline only if used once
                        // if you are using a variable "pletted" once you shouldn't use "plet"
                        arg instanceof Builtin && getNRequiredForces( arg.tag ) < 2
                    )
                )
                {
                    return expr( withUtility( varValue as any ) as any ).toUPLC( dbn );
                }

                return new Application(
                    new Lambda(
                        expr(
                            withUtility(
                                new Term(
                                    varValue.type,
                                    varAccessDbn => new UPLCVar( varAccessDbn - ( dbn + BigInt(1) ) ) // point to the lambda generated here
                                ) as any
                            ) as any
                        ).toUPLC( ( dbn + BigInt(1) ) )
                    ),
                    arg
                )
            }
        );

        return term;
    }
    return {
        in: continuation
    };
}