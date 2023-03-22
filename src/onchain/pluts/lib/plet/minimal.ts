import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import type { PType } from "../../PType";
import { Term } from "../../Term";

export function _plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> ): Term<PVarT>
{
    const someObj = {};
    const valueToIR = varValue.toIR;
    return new Term(
        varValue.type,
        dbn => {
            return new IRLetted(
                Number( dbn ),
                valueToIR( dbn )
            );
        }
    )
}