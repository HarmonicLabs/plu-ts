import { Machine } from "@harmoniclabs/plutus-machine";
import { pBool } from "../../std"

describe("Machine.evalSimple( boolStatement )", () => {

    test("simple bool", () => {
        
        expect(
            Machine.evalSimple(
                pBool( true )
                .and(
                    pBool( true )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

    });

    
})