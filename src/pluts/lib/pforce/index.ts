import { IRDelayed } from "../../../IR/IRNodes/IRDelayed";
import { IRForced } from "../../../IR/IRNodes/IRForced";
import { PType } from "../../PType";
import { PDelayed } from "../../PTypes";
import { Term } from "../../Term";
import { PrimType } from "../../../type_system";
import { UtilityTermOf, addUtilityForType } from "../std/UtilityTerms/addUtilityForType";

export function pforce<PInstance extends PType >( toForce: Term<PDelayed<PInstance>> ): UtilityTermOf<PInstance>
export function pforce<PInstance extends PType >( toForce: Term<PInstance> ): UtilityTermOf<PInstance>
export function pforce<PInstance extends PType >( toForce: Term<PDelayed<PInstance>> | Term<PInstance> ): UtilityTermOf<PInstance>
{
    const outType = toForce.type[0] === PrimType.Delayed ? toForce.type[1] : toForce.type; 

    return addUtilityForType( outType )(
        new Term(
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
        )
    ) as any;
}