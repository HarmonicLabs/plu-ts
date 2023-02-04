import { pstruct, pgenericStruct } from "../pstruct"
import { DataConstr } from "../../../../../types/Data/DataConstr";
import { DataI } from "../../../../../types/Data/DataI";
import { evalScript } from "../../../../CEK";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { ConstantableTermType, int, str } from "../../../Term/Type/base"
import { pInt } from "../../PInt";


const PMaybe = <T extends ConstantableTermType>( tyArg: T ) => {
    return pstruct({
        Just: { value: tyArg },
        Nothing: {}
    })
};

const PEither = <A extends ConstantableTermType, B extends ConstantableTermType>( a: A, b: B ) =>
    pstruct({
        Left: { left: a },
        Right: { right: b },
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