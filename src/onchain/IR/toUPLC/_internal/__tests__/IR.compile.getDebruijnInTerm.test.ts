import { fn, int, lam, tyVar } from "../../../../pluts";
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
                    lam( tyVar(), tyVar() ),
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
                    fn([ tyVar(), tyVar(), tyVar(), tyVar() ], tyVar() ),
                    target
                ),
                target
            )
        ).toBe( 4 );

    });


    test("not present", () => {

        expect(
            getDebruijnInTerm(
                new IRFunc(
                    fn([ tyVar(), tyVar(), tyVar(), tyVar() ], tyVar() ),
                    target.clone()
                ),
                target
            )
        ).toBe( -1 );

    });

})