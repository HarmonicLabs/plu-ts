import { ByteString } from "@harmoniclabs/bytestring";
import { bs, int } from "../../../../type_system";
import { pconsBs } from "../../builtins";
import { pByteString } from "../bs/pByteString";
import { pflip } from "../combinators";
import { pInt } from "../int/pInt";
import { Machine } from "@harmoniclabs/plutus-machine";


describe("pflip", () => {

    test("flip pconsBs", () => {

        const flippedCons = pflip( bs, int, bs ).$( pconsBs );

        const fst = pInt( 31 );
        const snd = pByteString( ByteString.fromAscii("hello") );
        expect(
            Machine.evalSimple(
                flippedCons.$( snd ).$( fst )
            )
        ).toEqual(
            Machine.evalSimple(
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