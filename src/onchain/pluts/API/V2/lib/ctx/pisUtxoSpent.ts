import { pcompose } from "../../../../stdlib/PCombinators";
import pisJust from "../../../../stdlib/PMaybe/pisJust";
import { phoist, plam } from "../../../../Syntax/syntax";
import { bool, lam, list } from "../../../../Term/Type/base";
import PTxOutRef from "../../../V1/Tx/PTxOutRef";
import PTxInInfo from "../../Tx/PTxInInfo";
import pfindTxInByTxOutRef from "./pfindTxInByTxOutRef";

const pisUtxoSpent = phoist(
    plam(
        PTxOutRef.type,
        lam(
            list( PTxInInfo.type ),
            bool
        )
    )( utxo =>
        pcompose
        .$( pisJust )
        .$(
            // any here is just fine; the type error is
            //
            // Type 'PStruct<{ Just: { val: ConstantableTermType; }; Nothing: {}; }>' is not assignable to type 'PMaybeT<PType>
            // which we know is the same exact type
            pfindTxInByTxOutRef.$( utxo ) as any
        )
    )
);

export default pisUtxoSpent;