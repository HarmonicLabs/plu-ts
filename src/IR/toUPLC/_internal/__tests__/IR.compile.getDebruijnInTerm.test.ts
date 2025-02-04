import { int } from "../../../../type_system";
import { IRConst } from "../../../IRNodes/IRConst";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getDebruijnInTerm } from "../getDebruijnInTerm"

describe("getDebruijnInTerm", () => {

    const target = new IRConst( int, 0 );

    test("zero", () => {

        expect(
            getDebruijnInTerm(
                new IRForced( target ),
                target
            )
        ).toBe( 0 );

    });

    test("one", () => {

        expect(
            getDebruijnInTerm(
                new IRFunc(
                    1,
                    target
                ),
                target
            )
        ).toBe( 1 );

    });

    test("4", () => {

        expect(
            getDebruijnInTerm(
                new IRFunc(
                    4,
                    target
                ),
                target
            )
        ).toBe( 4 );

    });


    test("deep equality (hash equality)", () => {

        expect(
            getDebruijnInTerm(
                new IRFunc(
                    4,
                    target.clone()
                ),
                target
            )
        ).toBe( 4 );

    });

})