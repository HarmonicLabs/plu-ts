import { bs, fn, int, lam, str } from "../../../../type_system/types";
import { getFnTypes } from "../getFnTypes";

describe("getFnTypes", () => {

    test("int", () => {

        expect(
            getFnTypes( int )
        ).toEqual([ int ]);

    });

    test("lam( int, bs )", () => {

        expect(
            getFnTypes( lam( int, bs ) )
        ).toEqual([ int, bs ]);
        
    });

    test("fn([ int, str ], bs )", () => {

        expect(
            getFnTypes( fn([ int, str ], bs ) )
        ).toEqual([ int, str, bs ]);
        
    });

})