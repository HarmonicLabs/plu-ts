import pmatch from "../../../../PTypes/PStruct/pmatch";
import { perror, pfn, phoist } from "../../../../Syntax";
import punsafeConvertType from "../../../../Syntax/punsafeConvertType";
import V1 from "../../../V1";
import PTxInInfo from "../../Tx/PTxInInfo";
import pfindOwnInput from "./pfindOwnInput";
import PTxInfo from "./PTxInfo";

const pownHash = phoist( pfn([
    PTxInfo.type,
    V1.PScriptPurpose.type
],  V1.PValidatorHash.type
)( ( txInfos, purpose ) => {

    return pmatch( pfindOwnInput.$( txInfos ).$( purpose ) )
    .onJust( rawJust => rawJust.extract("val").in( ({ val }) =>

        pmatch( punsafeConvertType( val, PTxInInfo.type ) )
        .onPTxInInfo( rawTxInInfo => rawTxInInfo.extract("resolved").in( ({ resolved }) => 

            pmatch( resolved )
            .onPTxOut( rawFields => rawFields.extract("address").in( ({ address }) =>
                
                pmatch( address )
                .onPAddress( ({extract}) => extract("credential").in( ({credential}) =>
                
                    pmatch( credential )
                    .onPScriptCredential( rawScriptCred => rawScriptCred.extract("valHash").in( ({ valHash }) => valHash ) )
                    // @ts-ignore
                    .onPPubKeyCredential( _ => perror( V1.PValidatorHash.type, "own input is not a validator hash" ) )
                ))
            ))
        ))
    ))
    // @ts-ignore
    .onNothing( _ => perror( V1.PValidatorHash.type, "can't find input" ) );

}));

export default pownHash;