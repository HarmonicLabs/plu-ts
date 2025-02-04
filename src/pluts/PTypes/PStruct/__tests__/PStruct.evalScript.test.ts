import { pstruct } from "../pstruct"
import { TermType, int, str } from "../../../../type_system";
import { pDataI } from "../../../lib";
import { DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";


const PMaybe = <T extends TermType>( tyArg: T ) => {
    return pstruct({
        Just: { value: tyArg },
        Nothing: {}
    })
};

const PEither = <A extends TermType, B extends TermType>( a: A, b: B ) =>
    pstruct({
        Left: { left: a },
        Right: { right: b },
    })

describe("evaluated struct", () => {

    describe("PMaybe", () => {

        test("Just == Constr 0 [ value ] ", () => {

            expect(
                Machine.evalSimple(
                    PMaybe( int ).Just({ value: pDataI(2) })
                )
            ).toEqual(
                CEKConst.data(
                    new DataConstr(
                        0, [ new DataI( 2 ) ]
                    )
                )
            )

            expect(
                Machine.evalSimple(
                    PMaybe( int ).Just({ value: pDataI(2) })
                )
            ).toEqual(
                CEKConst.data(
                    new DataConstr(
                        0, [ new DataI( 2 ) ]
                    )
                )
            )

        })

        test("Nothing == Constr 1 [] ", () => {

            expect(
                Machine.evalSimple(
                    PMaybe( int ).Nothing({})
                )
            ).toEqual(
                CEKConst.data(
                    new DataConstr(
                        1, []
                    )
                )
            )

            expect(
                Machine.evalSimple(
                    PMaybe( str ).Nothing({})
                )
            ).toEqual(
                CEKConst.data(
                    new DataConstr(
                        1, []
                    )
                )
            )

        })

    })
})