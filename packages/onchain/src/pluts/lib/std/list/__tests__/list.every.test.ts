import { Machine } from "@harmoniclabs/plutus-machine";
import { pevery } from "../pevery";
import { bool } from "../../../../type_system";
import { pList } from "../const";
import { pBool } from "../../bool";

describe("list.every", () => {
    
    function testList( bools: boolean[] )
    {
        const expected = bools.every( b => b );
        test( JSON.stringify( bools ) + " => " + expected, () => {
            expect(
                Machine.evalSimple(
                    pevery( bool )
                    .$( x => x )
                    .$( pList( bool )(bools.map(pBool)) )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    pBool( expected )
                )
            )
        });
    }

    testList([]);
    testList([true]);
    testList([false]);
    testList([true, true]);
    testList([true, false]);
    testList([false, true]);
    testList([true, true, true]);
})