import { Delay } from "../../UPLC/UPLCTerms/Delay";
import { PType } from "../PType";
import { PDelayed } from "../PTypes";
import { Term, Type } from "../Term";

export function pdelay<PInstance extends PType>(toDelay: Term<PInstance>): Term<PDelayed<PInstance>>
{
    return new Term(
        Type.Delayed( toDelay.type ),
        (dbn) => {
            return new Delay(
                toDelay.toUPLC( dbn )
            );
        }
    );
}