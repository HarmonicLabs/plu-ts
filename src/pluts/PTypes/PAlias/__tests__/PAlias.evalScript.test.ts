import { palias } from "../palias"
import { pInt } from "../../../lib/std/int/pInt";
import { int } from "../../../../type_system/types";
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";


describe("palias", () => {

    const FancyInt = palias( int );
    const fancy69 = FancyInt.from( pInt(69) )

    test("evaluates to the aliased type", () => {

        expect(
            Machine.evalSimple(
                fancy69
            )
        ).toEqual( CEKConst.int( 69 ) )

    });

    test("aliases can be used in place of original types", () => {

        expect(
            Machine.evalSimple(
                pInt(1).add( fancy69 as any )
            )
        ).toEqual( CEKConst.int( 69 + 1 ) )

    });


})