import { int } from "../../../pluts";
import { IRConst } from "../IRConst";
import { IRLetted } from "../IRLetted";
import { IRVar } from "../IRVar"


describe("IRLetted.hash", () => {

    test("same value with vars; different dbn => different hash", () => {

        const value = new IRVar(0);

        const a = new IRLetted( 1, value.clone() );
        const b = new IRLetted( 2, value.clone() );

        expect( a.value.hash ).toEqual( b.value.hash );
        expect( a.hash ).not.toEqual( b.hash );

    });

    test("different dbn doesn't apply if letted value doesn't include vars", () => {

        const value = new IRConst( int, 2 );

        const a = new IRLetted( 1, value.clone() );
        const b = new IRLetted( 2, value.clone() );

        expect( a.value.hash ).toEqual( b.value.hash );
        expect( a.hash ).toEqual( b.hash );

    });

    test("different vars; proportilonally different letted dbn => same hash", () => {

        const a = new IRLetted( 4, new IRVar( 1 ) );
        const b = new IRLetted( 6, new IRVar( 3 ) );

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).toEqual( b.hash );

    });

    test("different vars; un-proportilonally different letted dbn => different hash", () => {

        const a = new IRLetted( 4, new IRVar( 1 ) );
        const b = new IRLetted( 7, new IRVar( 3 ) );

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).not.toEqual( b.hash );

    });


})