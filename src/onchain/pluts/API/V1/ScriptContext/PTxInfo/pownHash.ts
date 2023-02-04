import { PTxInfo } from "./PTxInfo";
import { perror, pfn, phoist } from "../../../../Syntax/syntax";
import { pmatch } from "../../../../PTypes/PStruct/pmatch";
import { Term } from "../../../../Term";
import { PValidatorHash } from "../../ScriptsHashes/PValidatorHash";
import { PTxInInfo } from "../../Tx/PTxInInfo";
import { PScriptPurpose } from "../PScriptPurpose";
import { pfindOwnInput } from "./pfindOwnInput";
import { punsafeConvertType } from "../../../../Syntax/punsafeConvertType";


export const pownHash = phoist( pfn([
    PTxInfo.type,
    PScriptPurpose.type
],  PValidatorHash.type
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
                    .onPPubKeyCredential( _ => perror( PValidatorHash.type, "own input is not a validator hash" ) as Term<typeof PValidatorHash> )
                ))
            ))
        ))
    ))
    // @ts-ignore
    .onNothing( _ => perror( PValidatorHash.type, "can't find input" ) as Term<typeof PValidatorHash> );

}));