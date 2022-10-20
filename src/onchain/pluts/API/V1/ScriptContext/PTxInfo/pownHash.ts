import PTxInfo from ".";
import { PMaybeT } from "../../../../Prelude/PMaybe";
import pmatch from "../../../../PTypes/PStruct/pmatch";
import { perror, pfn, phoist, punsafeConvertType } from "../../../../Syntax";
import Term from "../../../../Term";
import PValidatorHash from "../../Scripts/PValidatorHash";
import PTxInInfo from "../../Tx/PTxInInfo";
import PScriptPurpose from "../PScriptPurpose";
import pfindOwnInput from "./pfindOwnInput";


const pownHash = phoist( pfn([
    PTxInfo.type,
    PScriptPurpose.type
],  PValidatorHash.type
)( ( txInfos, purpose ) => {

    return pmatch( pfindOwnInput.$( txInfos ).$( purpose ) as Term<PMaybeT<typeof PTxInInfo>> )
    .onJust( rawJust => rawJust.extract("val").in( ({ val }) =>

        pmatch( val as Term<typeof PTxInInfo> )
        .onPTxInInfo( rawTxInInfo => rawTxInInfo.extract("resolved").in( ({ resolved }) => 

            pmatch( resolved )
            .onPTxOut( rawFields => rawFields.extract("address").in( ({ address }) =>
                
                pmatch( address )
                .onPAddress( ({extract}) => extract("credential").in( ({credential}) =>
                
                    pmatch( credential )
                    .onPScriptCredential( rawScriptCred => rawScriptCred.extract("valHash").in( ({ valHash }) => valHash as Term<typeof PValidatorHash> ) )
                    .onPPubKeyCredential( _ => punsafeConvertType( perror( PValidatorHash.type, "own input is not a validator hash" ), PValidatorHash.type ) ) as Term<typeof PValidatorHash>
                ))
            ))
        ))
    ))
    .onNothing( _ => perror( PValidatorHash.type, "can't find input" ) ) as Term<typeof PValidatorHash>;

}));

export default pownHash;