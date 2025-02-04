import { Machine } from "@harmoniclabs/plutus-machine";
import { int, list } from "../../../../../type_system";
import { pstdEq } from "../pstdEq";
import { pList } from "../../list";
import { pInt } from "../../int";
import { pBool } from "../../bool/pBool";

describe("pstdEq", () => {

    test("list(int)", () => {

        const eq = pstdEq( list( int ) );

        // console.log( prettyUPLC( eq.toUPLC() ) )

        const pListInt = ( ns: number[] ) => pList( int )( ns.map( pInt ) );

        const eqTestExpected = Machine.evalSimple(
            pBool( true )
        );

        function eqTest( ns: number[] )
        {
            const res = Machine.evalSimple(
                eq
                .$( pListInt(ns) )
                .$( pListInt(ns) )
            );

            expect( res ).toEqual( eqTestExpected )
        }

        eqTest([]);
        eqTest([1]);
        eqTest([1,2,3,4]);
        eqTest([ 0, 1, -1, 2, -2 ]);

    });

})