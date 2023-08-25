import { Methods, Term, int, lam, pInt, padd, pfn } from "../../../../..";
import { addUserMethods } from "../addUserMethods";

describe("addUserMethod result", () => {


    test("int", () => {

        const baseTerm = pInt(0);

        const methods = {
            addOne : padd.$( 1 ),
            doMultipleStuff: pfn([ int, int ], int)
            (( self, other ) => self.add( other ) )
        };

        const term = addUserMethods( baseTerm, methods );

        const termKeys = Object.keys( term );

        expect( termKeys.includes("addOne") ).toEqual( true );
        expect( termKeys.includes("paddOne") ).toEqual( false );

        expect( term.addOne instanceof Term ).toBe( true )
        expect( term.paddOne ).toBe( undefined )

        expect( termKeys.includes("doMultipleStuff") ).toEqual( true );
        expect( termKeys.includes("pdoMultipleStuff") ).toEqual( true );

        expect( typeof term.doMultipleStuff ).toEqual("function");
        expect( term.pdoMultipleStuff instanceof Term ).toEqual( true );

        expect( term.pdoMultipleStuff.type ).toEqual( lam( int, int ) );
    });

    test("fail non well formed", () => {

        const baseTerm = pInt(0);

        const methods = {
            addOne : padd.$( 1 ),
            paddOne: pfn([ int, int ], int)
            (( self, other ) => self.add( other ) )
        };

        expect(() => {
            addUserMethods( baseTerm, methods );
        }).toThrow();

    })
})