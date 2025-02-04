import { pfn, pif, pisEmpty } from "../../../.."
import { Machine } from "@harmoniclabs/plutus-machine"
import { int, lam, list } from "../../../../../../type_system"
import { pdelay } from "../../../../pdelay"
import { pInt } from "../../../int"
import { precursiveList } from "../index";

describe("pmatch", () => {

    const plast =  precursiveList( int, int )
    .$( _ => pdelay( pInt( -1 ) ) )
    .$(
        pfn([
            lam( list( int ), int ),
            int, list( int ) 
        ], int )
        (( self, head, tail ) =>
            pif( int ).$( pisEmpty.$( tail ) )
            .then( head )
            .else( self.$( tail ) )
        )
    )

    test("nil", () => {

        expect(
            Machine.evalSimple(
                plast.$([])
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
               plast.$([pInt( 42 )])
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        )

    });

    test("[42,69]", () => {

        expect(
            Machine.evalSimple(
               plast.$([pInt( 42 ), pInt(69) ])
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 69 )
            )
        )

    });

})