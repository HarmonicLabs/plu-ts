import Term from ".";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import PType from "../PType";
import { FromPType } from "./Type";

export class HoistedTerm<PInstance extends PType> extends Term<PInstance>
{
    constructor( type: FromPType<PInstance>, toUPLC: ( dbn: bigint ) => UPLCTerm )
    {
        // throws if the term is not closed
        // for how terms are created it should never be the case
        const hoisted = new HoistedUPLC(
            toUPLC( BigInt( 0 ) )
        );
        super(
            type,
            _dbn => hoisted           
        );
    }

}

export default function phoist<PInstance extends PType, SomeExtension extends {} >( closedTerm: Term<PInstance> & SomeExtension ): HoistedTerm<PInstance> & SomeExtension
{
    const hoisted = new HoistedTerm( closedTerm.type, closedTerm.toUPLC ) as any;

    Object.keys( closedTerm ).forEach( k => 
        ObjectUtils.defineReadOnlyProperty(
            hoisted,
            k,
            (closedTerm as any)[ k ]
        )
    );

    return hoisted as any
}