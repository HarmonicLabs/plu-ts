import { bool, int } from "../../../../../../type_system";
import { pfn } from "../../../../pfn";
import { pBool } from "../../../bool/pBool";
import { isWellFormedMethods } from "../assertWellFormedMethods";

const fakeTerm = pfn([ int ], bool )(( n ) => pBool( true ));

describe("isWellFormedMethods", () => {

    test("only foo", () => {

        expect(
            isWellFormedMethods({
                foo: fakeTerm
            })
        ).toBe( true );

    });

    test("foo and pfoo", () => {

        expect(
            isWellFormedMethods({
                foo: fakeTerm,
                pfoo: fakeTerm
            })
        ).toBe( false );

    });

    test("foo and prop", () => {

        expect(
            isWellFormedMethods({
                foo: fakeTerm,
                prop: fakeTerm
            })
        ).toBe( true );

    });

    test("prop and pprop", () => {

        expect(
            isWellFormedMethods({
                pprop: fakeTerm,
                prop: fakeTerm
            })
        ).toBe( false );

    });

    test("prop and rop", () => {

        expect(
            isWellFormedMethods({
                rop: fakeTerm,
                prop: fakeTerm
            })
        ).toBe( false );

    });

    test("only rop", () => {

        expect(
            isWellFormedMethods({
                rop: fakeTerm
            })
        ).toBe( true );

    });

})