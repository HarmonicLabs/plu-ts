import Term from ".";
import UPLCTerm from "../../UPLC/UPLCTerm";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import PType from "../PType";

export class HoistedTerm<PInstance extends PType> extends Term<PInstance>
{
    constructor( toUPLC: ( dbn: bigint ) => UPLCTerm, pInstance: PInstance )
    {
        super(
            _dbn =>
                // throws if the term is not closed
                // for how terms are created it should never be the case
                new HoistedUPLC(
                    toUPLC( BigInt( 0 ) )
                ),
            pInstance
        );
    }

}

export default function phoist<PInstance extends PType>( closedTerm: Term<PInstance> ): HoistedTerm<PInstance>
{
    return new HoistedTerm( closedTerm.toUPLC, closedTerm.pInstance );
}