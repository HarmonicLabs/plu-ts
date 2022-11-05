import { peqBs } from "../../../../stdlib/Builtins";
import { pfindList } from "../../../../stdlib/List/methods";
import PMaybe from "../../../../stdlib/PMaybe/PMaybe";
import pmatch from "../../../../PTypes/PStruct/pmatch";
import { pfn, phoist, plam } from "../../../../Syntax/syntax";
import { bool } from "../../../../Term/Type/base";
import V1 from "../../../V1";
import PTxInfo from "./PTxInfo";
import PTxInInfo from "../../Tx/PTxInInfo";


const pfindOwnInput = phoist( pfn([
    PTxInfo.type,
    V1.PScriptPurpose.type
],  PMaybe( PTxInInfo.type ).type
)(( txInfos, purpose ) => {

    const PMaybeInputInfo = PMaybe( PTxInInfo.type );

    const result =  pmatch( purpose )
    .onSpending( rawPurpose => rawPurpose.extract("utxoRef").in( spendingPurpose => {

        return pmatch( spendingPurpose.utxoRef )
        .onPTxOutRef( rawUtxoRef => rawUtxoRef.extract("id").in( utxoRef => 

            pmatch( utxoRef.id )
            .onPTxId( rawId => rawId.extract("txId").in( ({ txId }) => 

                pmatch( txInfos )
                .onPTxInfo( ({ extract }) => extract("inputs").in( ({ inputs }) =>
                    
                    pfindList( PTxInInfo.type )
                    .$(
                        plam( PTxInInfo.type, bool )(
                            input => 

                            pmatch( input )
                            .onPTxInInfo( ({ extract }) => extract("utxoRef").in( ({ utxoRef }) =>

                                pmatch( utxoRef )
                                .onPTxOutRef( ({ extract }) => extract("id").in( ({ id }) =>

                                    pmatch( id )
                                    .onPTxId( ({ extract }) => extract("txId").in( input =>

                                        peqBs.$( input.txId ).$( txId )

                                    ))
                                )

                            )))
                        )
                    )
                    .$( inputs )

                ))

            )
            
        ))

    )}))
    ._( _ => PMaybeInputInfo.Nothing({}) as any )

    return result;

}));

export default pfindOwnInput;