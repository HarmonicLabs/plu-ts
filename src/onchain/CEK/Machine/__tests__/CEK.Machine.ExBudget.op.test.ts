import {ExBudget} from "../ExBudget";

describe("CEK :: Machine :: ExBudget :: op", () => {

    test("add", () => {

        const a = new ExBudget( 1, 2 );

        a.add( new ExBudget( 2, 1 ) );

        expect( a.cpu ).toBe( 3n );
        expect( a.mem ).toBe( 3n );

    });

    test("sub", () => {

        const a = new ExBudget( 10, 20 );

        a.sub( new ExBudget( 5, 5 ) );

        expect( a.cpu ).toBe( 5n );
        expect( a.mem ).toBe( 15n );

    })
})