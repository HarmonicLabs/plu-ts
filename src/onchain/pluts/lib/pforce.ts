import { Delay } from "../../UPLC/UPLCTerms/Delay";
import { Force } from "../../UPLC/UPLCTerms/Force";
import { PType } from "../PType";
import { PDelayed } from "../PTypes";
import { Term } from "../Term";
import { isDelayedType } from "../Term/Type/kinds";
import { UtilityTermOf, addUtilityForType } from "./addUtilityForType";

export function pforce<PInstance extends PType >
( toForce: Term<PDelayed<PInstance>> | Term<PInstance> ): UtilityTermOf<PInstance>
{
    const outType = isDelayedType( toForce.type ) ? toForce.type[ 1 ] : toForce.type 

    return addUtilityForType( outType )(
        new Term(
            outType as any,
            (dbn) => {
                const toForceUPLC = toForce.toUPLC( dbn );

                // if directly applying to Delay UPLC just remove the delay
                // example:
                // (force (delay (con int 11))) === (con int 11)
                if( toForceUPLC instanceof Delay )
                {
                    return toForceUPLC.delayedTerm;
                }

                // any other case
                return new Force(
                    toForceUPLC
                );
            }
        )
    ) as any;
}