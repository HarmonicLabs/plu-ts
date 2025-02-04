import { Machine } from "@harmoniclabs/plutus-machine"
import { pchooseList } from ".."
import { int, unit } from "../../../../../type_system/types"
import { pInt } from "../../../std/int/pInt"
import { perror } from "../../../perror"

describe("list.builtins", () => {

    describe("pchooseList", () => {

        test("[] -> 0", () => {
            expect(
                Machine.evalSimple(
                    pchooseList( unit, int )
                    .$( [] as any )
                    .$( pInt(0) )
                    .$( perror( int ) )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    pInt( 0 )
                )
            )
        });

        test("[] -> 0", () => {
            expect(
                Machine.evalSimple(
                    pchooseList( unit, int )
                    .$( [] as any )
                    .$( pInt(0) )
                    .$( perror( int ) )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    pInt( 0 )
                )
            )
        });

    })
})