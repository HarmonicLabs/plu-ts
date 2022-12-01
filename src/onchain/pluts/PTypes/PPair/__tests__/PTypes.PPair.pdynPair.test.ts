import ByteString from "../../../../../types/HexString/ByteString";
import evalScript from "../../../../CEK";
import { showUPLC } from "../../../../UPLC/UPLCTerm";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { plam } from "../../../Syntax";
import { bool, bs, int, pair, tyVar } from "../../../Term/Type/base";
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

    });

    test("fancy fst", () => {

        const fancyFstIntEq = plam( pair( int, tyVar() ), bool )
        ( p => p.fst.eq( p.fst ) )


        const result = fancyFstIntEq.$(
            pdynPair( int, int )( pInt(1).add( pInt(3) ), pInt(2) )
        );

        console.log(
            showUPLC(
                result.toUPLC(0)
            )
        )

        console.log(
            evalScript(
                result
            )
        );

    })

});