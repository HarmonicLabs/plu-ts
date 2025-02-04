import { Machine } from "@harmoniclabs/plutus-machine"
import { pmatchList } from ".."
import { pfn } from "../../../.."
import { int, list } from "../../../../../../type_system"
import { pdelay } from "../../../../pdelay"
import { pInt } from "../../../int"


describe("pmatch", () => {

    test("nil", () => {

        expect(
            Machine.evalSimple(
                pmatchList( int, int )
                .$( pdelay( pInt( -1 ) ) )
                .$(
                    pfn([ int, list( int ) ], int )
                    (( head, _tail ) => head )
                )
                .$([] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( -1 )
            )
        )

    });

    test("[42]", () => {

        expect(
            Machine.evalSimple(
                pmatchList( int, int )
                .$( pdelay( pInt( -1 ) ) )
                .$(
                    pfn([ int, list( int ) ], int )
                    (( head, _tail ) => head )
                )
                .$([pInt( 42 )] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        )

    });

})