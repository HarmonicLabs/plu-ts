import Term from ".";
import UPLCTerm from "../../UPLC/UPLCTerm";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import PType from "../PType";
import { FromPType } from "./Type";

export class HoistedTerm<PInstance extends PType> extends Term<PInstance>
{
    constructor( type: FromPType<PInstance>, toUPLC: ( dbn: bigint ) => UPLCTerm )
    {
        super(
            type,
            _dbn =>
                // throws if the term is not closed
                // for how terms are created it should never be the case
                new HoistedUPLC(
                    toUPLC( BigInt( 0 ) )
                )
        );
    }

}

export default function phoist<PInstance extends PType>( closedTerm: Term<PInstance> ): HoistedTerm<PInstance>
{
    return new HoistedTerm( closedTerm.type, closedTerm.toUPLC );
}