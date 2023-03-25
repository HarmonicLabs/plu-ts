import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import { isClosedIRTerm } from "../../../IR/utils/isClosedIRTerm";
import type { PType } from "../../PType";
import { Term } from "../../Term";

export function _plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> ): Term<PVarT>
{
    const valueToIR = varValue.toIR;
    return new Term(
        varValue.type,
        dbn => {

            const ir = valueToIR( dbn );

            if( ir instanceof IRLetted || ir instanceof IRHoisted ) return ir;

            if( isClosedIRTerm( ir ) ) return new IRHoisted( ir );

            return new IRLetted(
                Number( dbn ),
                valueToIR( dbn )
            );
        }
    )
}