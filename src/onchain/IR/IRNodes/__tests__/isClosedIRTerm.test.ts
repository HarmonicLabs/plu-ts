import { isClosedIRTerm } from "../../utils/isClosedIRTerm"
import { IRApp } from "../IRApp"
import { IRConst } from "../IRConst"
import { IRFunc } from "../IRFunc"
import { IRNative } from "../IRNative"
import { IRVar } from "../IRVar"

describe("isClosedIRTerm", () => {

    test("just a var", () => {

        expect( isClosedIRTerm( new IRVar(0) ) ).toBe( false );

    })

    test("id", () => {

        const _id = new IRFunc(
            1,
            new IRVar(0)
        );

        expect( isClosedIRTerm( _id ) ).toBe( true );

    })

    test("const", () => {

        const _const = new IRFunc(
            1,
            (() => {

                const result = new IRFunc(
                    1,
                    new IRVar( 1 )
                );

                expect(
                    isClosedIRTerm( result )
                ).toBe( false )

                return result;
            })()
        );

        expect(
            isClosedIRTerm( _const )
        ).toBe( true )

    });

    test("proper const", () => {

        const body = new IRVar(1);
        const _const = new IRFunc(
            2,
            body
        );

        expect(
            isClosedIRTerm( body )
        ).toBe( false )

        expect(
            isClosedIRTerm( _const )
        ).toBe( true )

    });

    test("[(native addInteger) (const int 2)] -> true", () => {

        expect(
            isClosedIRTerm(
                new IRApp(
                    IRNative.addInteger,
                    IRConst.int( 2 )
                )
            )
        ).toEqual( true );

    });
    
})