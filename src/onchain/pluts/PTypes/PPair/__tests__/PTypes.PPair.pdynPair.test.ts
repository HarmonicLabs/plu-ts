import ByteString from "../../../../../types/HexString/ByteString";
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { bs, int, pair } from "../../../Term/Type/base";
import { pByteString } from "../../PByteString";
import { pInt } from "../../PInt";
import { pdynPair } from "../pdynPair";

describe("pdynPair",() => {

    test("fst | snd", () => {

        const helloBS = pByteString(ByteString.fromAscii("hello"));
        const pairIntBS = pdynPair( int, bs )( pInt(2).add(2), helloBS );
        const pairIntBSConst = pdynPair( int, bs )( pInt(2), helloBS );

        expect(
            (pairIntBS as any).__isDynamicPair
        ).toBe( true )
        expect(
            (pairIntBSConst as any).__isDynamicPair
        ).toBe( undefined )

        expect(
            evalScript(
                pairIntBS.fst
            )
        ).toEqual(
            UPLCConst.int( 4 )
        )
        expect(
            evalScript(
                pairIntBSConst.fst
            )
        ).toEqual(
            UPLCConst.int( 2 )
        )
        
        expect(
            evalScript(
                pairIntBS.snd
            )
        ).toEqual(
            evalScript(
                helloBS
            )
        )

    })

});