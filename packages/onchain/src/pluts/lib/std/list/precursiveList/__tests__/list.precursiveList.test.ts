import { pfn, pif, pisEmpty } from "../../../.."
import { Machine } from "@harmoniclabs/plutus-machine"
import { int, lam, list } from "../../../../../type_system"
import { pdelay } from "../../../../pdelay"
import { pInt } from "../../../int"
import { precursiveList } from "../index";
import { showUPLC } from "@harmoniclabs/uplc"

describe("precursiveList", () => {

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

    test.only("nil", () => {

        console.log( showUPLC( plast.$([] as any).toUPLC() ) );

        expect(
            Machine.evalSimple(
                plast.$([] as any)
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
               plast.$([pInt( 42 )] as any)
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
               plast.$([pInt( 42 ), pInt(69) ] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 69 )
            )
        )

    });

})