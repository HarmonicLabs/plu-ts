import { Machine } from "@harmoniclabs/plutus-machine"
import { pfn } from "../../../.."
import { int, list } from "../../../../../../type_system"
import { pdelay } from "../../../../pdelay"
import { pInt } from "../../../int"
import { _pmatchList } from "../minimal"


describe("_pmatchList", () => {

    test("nil", () => {

        expect(
            Machine.evalSimple(
                _pmatchList( int, int )
                .$( pdelay( pInt( -1 ) ) )
                .$(
                    pfn([ int, list( int ) ], int )
                    (( head, _tail ) => head )
                )
                .$([])
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
                _pmatchList( int, int )
                .$( pdelay( pInt( -1 ) ) )
                .$(
                    pfn([ int, list( int ) ], int )
                    (( head, _tail ) => head )
                )
                .$([pInt( 42 )])
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        )

    });

})