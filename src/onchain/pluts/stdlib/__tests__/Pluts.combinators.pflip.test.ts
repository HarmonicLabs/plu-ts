import ByteString from "../../../../types/HexString/ByteString";
import evalScript from "../../../CEK";
import { pByteString } from "../../PTypes/PByteString";
import { pInt } from "../../PTypes/PInt";
import { pconsBs } from "../Builtins";
import { pflip } from "../PCombinators"


describe("pflip", () => {

    test("flip pconsBs", () => {

        const flippedCons = pflip.$( pconsBs );

        const fst = pInt( 31 );
        const snd = pByteString( ByteString.fromAscii("hello") );
        expect(
            evalScript(
                flippedCons.$( snd ).$( fst )
            )
        ).toEqual(
            evalScript(
                pconsBs.$( fst ).$( snd )
            )
        )

        expect(
            flippedCons.$( snd ).$( fst )
        ).not.toEqual(
            pconsBs.$( fst ).$( snd )
        )

    })
})