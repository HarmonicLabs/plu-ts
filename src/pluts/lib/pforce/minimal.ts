import { IRDelayed } from "../../../IR/IRNodes/IRDelayed";
import { IRForced } from "../../../IR/IRNodes/IRForced";
import { PType } from "../../PType";
import { PDelayed } from "../../PTypes/PDelayed";
import { Term } from "../../Term";
import { PrimType } from "../../../type_system/types";

export function _pforce<PInstance extends PType >
( toForce: Term<PDelayed<PInstance>> | Term<PInstance> ): Term<PInstance>
{
    const outType = toForce.type[0] === PrimType.Delayed ? toForce.type[1] : toForce.type; 

    return new Term(
            outType as any,
            (cfg, dbn) => {
                const toForceUPLC = toForce.toIR( cfg, dbn );

                // if directly applying to Delay UPLC just remove the delay
                // example:
                // (force (delay (con int 11))) === (con int 11)
                if( toForceUPLC instanceof IRDelayed )
                {
                    return toForceUPLC.delayed;
                }

                // any other case
                return new IRForced(
                    toForceUPLC
                );
            }
        );
}

export const pforce_minimal = _pforce;