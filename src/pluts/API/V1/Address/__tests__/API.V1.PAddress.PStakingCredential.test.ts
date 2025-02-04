import { pstruct } from "../../../../PTypes/PStruct/pstruct";
import { isStructDefinition } from "../../../../../type_system";
import { int } from "../../../../../type_system/types";
import { PPubKeyHash } from "../../PubKey/PPubKeyHash";
import { PValidatorHash } from "../../ScriptsHashes/PValidatorHash";
import { PCredential } from "../PCredential";


describe("PStakingCredential", () => {

    test("def", () => {

        const PCredentialSDef = {
            PPubKeyCredential: { pkh: PPubKeyHash.type },
            PScriptCredential: { valHash: PValidatorHash.type },
        };

        expect(
            isStructDefinition( PCredentialSDef )
        ).toBe( true )

        expect(
            isStructDefinition({
                PStakingHash: { _0: PCredential.type },
                PStakingPtr: {
                    _0: int,
                    _1: int,
                    _2: int
                }
            })
        ).toBe( true )

        const TestPStakingCredential = pstruct({
            PStakingHash: { _0: PCredential.type },
            PStakingPtr: {
                _0: int,
                _1: int,
                _2: int
            }
        });
        
    })
})