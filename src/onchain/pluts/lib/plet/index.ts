import type { PType } from "../../PType";
import { IRApp } from "../../../../../../src/onchain/IR/IRNodes/IRApp";
import { IRFunc } from "../../../../../../src/onchain/IR/IRNodes/IRFunc";
import { IRLetted } from "../../../../../../src/onchain/IR/IRNodes/IRLetted";
import { IRVar } from "../../../../../../src/onchain/IR/IRNodes/IRVar";
import { Term } from "../../Term";
import { PrimType } from "../../type_system/types";
import { UtilityTermOf, addUtilityForType } from "../addUtilityForType";
import { _fromData } from "../std/data/conversion/fromData_minimal";
import { isClosedIRTerm } from "../../../../../../src/onchain/IR/utils/isClosedIRTerm";
import { IRHoisted } from "../../../../../../src/onchain/IR/IRNodes/IRHoisted";

export type LettedTerm<PVarT extends PType> = UtilityTermOf<PVarT> & {
    in: <PExprResult extends PType>( expr: (value: UtilityTermOf<PVarT>) => Term<PExprResult> ) => Term<PExprResult>
}

export function plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> & SomeExtension ): LettedTerm<PVarT>
{
    type TermPVar = Term<PVarT> & SomeExtension;

    // unwrap 'asData' if is the case
    varValue = (varValue.type[0] === PrimType.AsData ? _fromData( varValue.type[1] )( varValue as any ) : varValue) as any;

    const type = varValue.type;

    const letted = new Term(
        type,
        dbn => {

            const ir =  varValue.toIR( dbn );

            // `compileIRToUPLC` can handle it even if this check is not present
            // but why spend useful tree iterations if we can avoid them here?
            if(
                ir instanceof IRLetted || 
                ir instanceof IRHoisted || 
                ir instanceof IRVar 
            )
            {
                return ir;
            }

            if( isClosedIRTerm( ir ) )
            {
                return new IRHoisted( ir );
            }

            return new IRLetted(
                Number( dbn ),
                ir
            );
        }
    );
    
    const continuation = <PExprResult extends PType>( expr: (value: TermPVar) => Term<PExprResult> ): Term<PExprResult> => {

        const withUtility = addUtilityForType( varValue.type );
        // only to extracts the type; never compiled
        const outType = expr(
            withUtility(
                new Term(
                    varValue.type,
                    _varAccessDbn => new IRVar( 0 ) // mock variable
                ) as any
            ) as any
        ).type;

        // return papp( plam( varValue.type, outType )( expr as any ), varValue as any ) as any;
        const term = new Term(
            outType,
            dbn => {
                const arg = varValue.toIR( dbn );

                if(
                    // inline variables; no need to add an application since already in scope
                    arg instanceof IRVar
                )
                {
                    return expr( withUtility( varValue as any ) as any ).toIR( dbn );
                }

                return new IRApp(
                    new IRFunc(
                        1,
                        expr(
                            withUtility(
                                new Term(
                                    varValue.type,
                                    varAccessDbn => new IRVar( varAccessDbn - ( dbn + BigInt(1) ) ) // point to the lambda generated here
                                ) as any
                            ) as any
                        ).toIR( ( dbn + BigInt(1) ) )
                    ),
                    arg
                )
            }
        );

        return term;
    }
    
    Object.defineProperty(
        letted, "in", {
            value: continuation,
            writable: false,
            enumerable: false,
            configurable: false
        }
    );

    return addUtilityForType( type )( letted ) as any;
}