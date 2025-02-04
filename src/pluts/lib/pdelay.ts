import { IRDelayed } from "../../IR/IRNodes/IRDelayed";
import { PType } from "../PType";
import { PDelayed } from "../PTypes";
import { Term } from "../Term";
import { delayed } from "../../type_system/types";

export function pdelay<PInstance extends PType>(toDelay: Term<PInstance>): Term<PDelayed<PInstance>>
{
    return new Term(
        delayed( toDelay.type ),
        (cfg, dbn) => {
            return new IRDelayed(
                toDelay.toIR( cfg, dbn )
            );
        }
    );
}