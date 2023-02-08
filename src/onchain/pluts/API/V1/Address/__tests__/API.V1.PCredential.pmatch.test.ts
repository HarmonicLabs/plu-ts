import { Term } from "../../../.."
import { PAlias, pmatch } from "../../../../PTypes"
import { PrimType } from "../../../../Term"
import { UtilityTermOf, pByteString, perror } from "../../../../lib"
import { PPubKeyHash } from "../../PubKey/PPubKeyHash"
import { PCredential } from "../PCredential"

type t = UtilityTermOf<PAlias<[PrimType.BS], symbol>>
type _t = PAlias<[PrimType.BS], symbol>

describe("pmatch( PCredentials )", () => {

    test("finds ctros", () => {

        expect(
            pmatch(
                PCredential.PPubKeyCredential({
                    pkh: PPubKeyHash.from(pByteString("ff".repeat(28)))
                })
            )
            .onPPubKeyCredential( _ => 
                _.extract("pkh")
                .in(
                    ({ pkh }) => pkh
                )
            )
            .onPScriptCredential( _ => perror( PPubKeyHash.type ) )
        )
    })
})