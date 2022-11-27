import { pfn, phoist } from "../../../../Syntax/syntax";
import { bool } from "../../../../Term/Type/base";
import PTxOutRef from "../../../V1/Tx/PTxOutRef";

const peqUtxoRef = phoist(
    pfn([
        PTxOutRef.type,
        PTxOutRef.type
    ],  bool)
    ((a,b) => 
        a.extract("id","index").in( fst =>
        b.extract("id","index").in( snd =>

            fst.index.eq( snd.index )
            .and(
                fst.id.extract("txId").in( ({ txId: fstId }) =>
                snd.id.extract("txId").in( ({ txId: sndId }) =>
                    fstId.eq( sndId )
                ))
            )

        ))
    )
);

export default peqUtxoRef;