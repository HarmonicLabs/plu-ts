import { Machine } from "@harmoniclabs/plutus-machine";
import { psop } from "../../../PTypes/PSoP/psop";
import { bs, int } from "../../../type_system";
import { pBs } from "../../std";
import { pInt } from "../../std/int/pInt";
import { pmatch } from "../pmatch";
import { showUPLC } from "@harmoniclabs/uplc";
import { showIR } from "../../../../IR";

const AB = psop({
    A: {
        n: int,
        b: bs
    },
    B: {
        b: bs
    }
});

describe("pmatch( sop )",() => {

    describe("AB", () => {

        test("get n", () => {

            const term = pmatch( AB.A({ n: pInt( 1 ), b: pBs("abcd") }) )
            .onA(({ n, b }) => {
                return n.add( b.length );
            })
            .onB(({ b }) => b.length );

            console.log( showIR( term.toIR( 0 ) ) );

            const result = Machine.evalSimple( term );

            console.log( result );
        })
    });

})