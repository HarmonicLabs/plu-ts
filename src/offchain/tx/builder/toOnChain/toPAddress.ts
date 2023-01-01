import UPLCConst from "../../../../onchain/UPLC/UPLCTerms/UPLCConst";
import PAddress from "../../../../onchain/pluts/API/V1/Address/PAddress";
import Term from "../../../../onchain/pluts/Term";
import Address from "../../../ledger/Address";

export default function toPAddress( addr: Address ): Term<typeof PAddress>
{
    return new Term(
        PAddress.type,
        _dbn => UPLCConst.data( addr.toData() )
    )
}