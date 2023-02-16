import { Delay } from "../../../UPLC/UPLCTerms/Delay";
import { Force } from "../../../UPLC/UPLCTerms/Force";
import { PType } from "../../PType";
import { PDelayed } from "../../PTypes/PDelayed";
import { Term } from "../../Term";
import { PrimType } from "../../type_system/types";

export function pforce_minimal<PInstance extends PType >
( toForce: Term<PDelayed<PInstance>> | Term<PInstance> ): Term<PInstance>
{
    const outType = toForce.type[0] === PrimType.Delayed ? toForce.type[1] : toForce.type; 

    return new Term(
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
        );
}