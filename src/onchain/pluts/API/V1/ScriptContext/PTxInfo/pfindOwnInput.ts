import PTxInfo from ".";
import { peqBs } from "../../../../stdlib/Builtins";
import { pfindList } from "../../../../stdlib/List";
import PMaybe, { PMaybeT } from "../../../../stdlib/PMaybe";
import PBool from "../../../../PTypes/PBool";
import { TermFn } from "../../../../PTypes/PFn/PLam";
import pmatch from "../../../../PTypes/PStruct/pmatch";
import { pfn, phoist, plam } from "../../../../Syntax";
import Term from "../../../../Term";
import { bool } from "../../../../Term/Type";
import PTxInInfo from "../../Tx/PTxInInfo";
import PScriptPurpose from "../PScriptPurpose";


const pfindOwnInput = phoist( pfn([
    PTxInfo.type,
    PScriptPurpose.type
],  PMaybe( PTxInInfo.type ).type
)(( txInfos, purpose ) => {

    const PMaybeInputInfo = PMaybe( PTxInInfo.type );

    const result =  pmatch( purpose )
    .onSpending( rawPurpose => rawPurpose.extract("utxoRef").in( spendingPurpose =>

        pmatch( spendingPurpose.utxoRef )
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
                            .onPTxInInfo( ({ extract }) => extract("outRef").in( ({ outRef }) =>

                                pmatch( outRef )
                                .onPTxOutRef( ({ extract }) => extract("id").in( ({ id }) =>

                                    pmatch( id )
                                    .onPTxId( ({ extract }) => extract("txId").in( input =>

                                        peqBs.$( input.txId ).$( txId )

                                    ))
                                )

                            ))) as Term<PBool>

                        )
                    )
                    .$( inputs )

                ))

            )
            
        ))

    )))
    ._( _ => PMaybeInputInfo.Nothing({}) as any )

    return result;

}));

export default pfindOwnInput;