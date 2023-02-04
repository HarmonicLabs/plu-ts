import { ByteString } from "../../../../../types/HexString/ByteString";
import { evalScript } from "../../../../CEK";
import { pconsBs } from "../../builtins";
import { pByteString } from "../bs/pByteString";
import { pflip } from "../combinators";
import { pInt } from "../int/pInt";


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