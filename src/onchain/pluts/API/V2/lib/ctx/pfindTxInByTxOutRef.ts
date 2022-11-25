import { pfind } from "../../../../stdlib/List/methods";
import PMaybe from "../../../../stdlib/PMaybe/PMaybe";
import { phoist, plam } from "../../../../Syntax/syntax";
import { lam, list } from "../../../../Term/Type/base";
import PTxOutRef from "../../../V1/Tx/PTxOutRef";
import PTxInInfo from "../../Tx/PTxInInfo";
import peqUtxoRef from "./peqUtxoRef";

const pfindTxInByTxOutRef = phoist(
    plam(
        PTxOutRef.type,
        lam(
            list( PTxInInfo.type ),
            PMaybe( PTxInInfo.type ).type
        )
    )( utxoRef =>
        pfind( PTxInInfo.type )
        .$(
            txInfo => txInfo.extract("utxoRef").in( txInfo => 
                peqUtxoRef.$( utxoRef ).$( txInfo.utxoRef )
            )
        )
    )
)

export default pfindTxInByTxOutRef;