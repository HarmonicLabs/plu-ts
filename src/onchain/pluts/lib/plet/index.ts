import type { PType } from "../../PType";
import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { Term } from "../../Term";
import { PrimType } from "../../type_system/types";
import { UtilityTermOf, addUtilityForType } from "../addUtilityForType";
import { _fromData } from "../std/data/conversion/fromData_minimal";

export type LettedTerm<PVarT extends PType> = UtilityTermOf<PVarT> & {
    /**
     * @deprecated you can use the result of `plet` directly
     * 
     * @example
     * ```ts
     * const myTerm = plet( myValue );
     * ```
     * 
     * ## the `in` method will be removed in a future version
    **/
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
        dbn => new IRLetted(
            Number( dbn ),
            varValue.toIR( dbn )
        )
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