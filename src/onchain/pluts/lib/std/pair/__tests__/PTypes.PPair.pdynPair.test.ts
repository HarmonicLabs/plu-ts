import { ByteString } from "../../../../../../types/HexString/ByteString";
import { Machine } from "../../../../../CEK";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { bool, bs, int, pair, tyVar } from "../../../../Term/Type/base";
import { plam } from "../../../plam";
import { pByteString } from "../../bs/pByteString";
import { pInt } from "../../int/pInt";
import { pPair } from "../pPair";
import { pdynPair } from "../pdynPair";

describe("pdynPair",() => {

    test("fst | snd", () => {

        const helloBS = pByteString(ByteString.fromAscii("hello"));
        const pairIntBS = pdynPair( int, bs )( pInt(2).add(2), helloBS );
        const _pairIntBS = pdynPair( int, bs )( pInt(2), helloBS );
        const pairIntBSConst = pPair( int, bs )( pInt(2), helloBS );

        expect(
            (pairIntBS as any).__isDynamicPair
        ).toBe( true )
        expect(
            (pairIntBSConst as any).__isDynamicPair
        ).toBe( undefined )

        expect(
            Machine.evalSimple(
                pairIntBS.fst
            )
        ).toEqual(
            UPLCConst.int( 4 )
        )
        expect(
            Machine.evalSimple(
                pairIntBSConst.fst
            )
        ).toEqual(
            UPLCConst.int( 2 )
        )
        
        expect(
            Machine.evalSimple(
                pairIntBS.snd
            )
        ).toEqual(
            Machine.evalSimple(
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

    })

});