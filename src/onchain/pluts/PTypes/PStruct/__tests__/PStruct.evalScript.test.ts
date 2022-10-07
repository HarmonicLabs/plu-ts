import pstruct, { pgenericStruct } from ".."
import DataConstr from "../../../../../types/Data/DataConstr";
import DataI from "../../../../../types/Data/DataI";
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { int, str, struct } from "../../../Term/Type"
import { pInt } from "../../PInt";


const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
});

const PEither = pgenericStruct( ( a, b ) => {
    return {
        Left: { value: a },
        Rigth: { value: b },
    }
})

describe("evaluated struct", () => {

    describe("PMaybe", () => {

        test("Just == Constr 0 [ value ] ", () => {

            expect(
                evalScript(
                    PMaybe( int ).Just({ value: pInt(2) })
                )
            ).toEqual(
                UPLCConst.data(
                    new DataConstr(
                        0, [ new DataI( 2 ) ]
                    )
                )
            )

            expect(
                evalScript(
                    PMaybe( int ).Just({ value: pInt(2) })
                )
            ).toEqual(
                UPLCConst.data(
                    new DataConstr(
                        0, [ new DataI( 2 ) ]
                    )
                )
            )

        })

        test("Nothing == Constr 1 [] ", () => {

            expect(
                evalScript(
                    PMaybe( int ).Nothing({})
                )
            ).toEqual(
                UPLCConst.data(
                    new DataConstr(
                        1, []
                    )
                )
            )

            expect(
                evalScript(
                    PMaybe( str ).Nothing({})
                )
            ).toEqual(
                UPLCConst.data(
                    new DataConstr(
                        1, []
                    )
                )
            )

        })

    })
})