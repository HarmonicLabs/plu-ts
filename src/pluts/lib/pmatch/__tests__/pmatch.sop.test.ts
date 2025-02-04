import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";
import { psop } from "../../../PTypes/PSoP/psop";
import { bs, int } from "../../../../type_system";
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

        test("n + b.length", () => {

            const term = pmatch( AB.A({ n: pInt( 1 ), b: pBs("abcd") }) )
            .onA(({ n, b }) => {
                return n.add( b.length );
            })
            .onB(({ b }) => b.length );

            const result = Machine.evalSimple( term );

            expect( result )
            .toEqual(
                CEKConst.int( 3 )
            );

        });

        test("b.length", () => {

            const term = pmatch( AB.B({ b: pBs("abcd") }) )
            .onA(({ n, b }) => {
                return n.add( b.length );
            })
            .onB(({ b }) => b.length );

            const result = Machine.evalSimple( term );

            expect( result )
            .toEqual(
                CEKConst.int( 2 )
            );

        });

    });

    test("3 fields", () => {

        const Fs = psop({
            Fs: {
                a: int,
                b: int,
                c: int
            }
        });

        const term = pmatch( Fs.Fs({ a: pInt( 1 ), b: pInt( 2 ), c: pInt( 3 ) }) )
        .onFs(({ a, b, c }) => {
            return a.add( b ).mult( c );
        })

        const result = Machine.evalSimple( term );

        expect( result )
        .toEqual(
            CEKConst.int( 9 )
        );

    })

})