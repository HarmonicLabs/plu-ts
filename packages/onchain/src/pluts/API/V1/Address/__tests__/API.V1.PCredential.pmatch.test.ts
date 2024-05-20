import { perror, pmatch, toData } from "../../../../lib"
import { PPubKeyHash } from "../../PubKey/PPubKeyHash"
import { PCredential } from "../PCredential"


describe("pmatch( PCredentials )", () => {

    test("finds ctros", () => {

        expect(
            pmatch(
                PCredential.PPubKeyCredential({
                    pkh: toData( PPubKeyHash.type )( PPubKeyHash.from("ff".repeat(28)) )
                })
            )
            .onPPubKeyCredential( ({ pkh }) => pkh )
            .onPScriptCredential( _ => perror( PPubKeyHash.type ) as any )
        );

    });
    
})