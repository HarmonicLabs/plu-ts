import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { isClosedIRTerm } from "../../../IR/utils/isClosedIRTerm";
import type { PType } from "../../PType";
import { Term } from "../../Term";

export function _plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> ): Term<PVarT>
{
    return new Term(
        varValue.type,
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
    )
}