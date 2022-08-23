import { curry, fixFuncInputType } from "..";
import PType from "../../../../onchain/pluts/PType";


describe( "curry", () => {

    it("identity for void functions", () => {

        function trueFn(): true { return true };

        expect( typeof curry( trueFn ) ).toBe( "function" );
        expect( typeof curry( trueFn )() ).toBe( "boolean" );

        expect( trueFn() ).toEqual( curry( trueFn )() );

    });

    it("identity for single arg functions", () => {

        function double( a: number ): number { return a * 2 };
        const cDouble = curry( double );

        expect( typeof cDouble ).toBe("function");
        expect( typeof cDouble( 1 ) ).toBe("number");

        for( let i = 0; i < 10_000; i++ )
        {
            const input = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            expect( double( input ) ).toBe( cDouble( input ) );
        }

    });

    it("two args functions are curried keeping the types", () => {

        function add( a: number, b: number ): number { return a + b };
        const cAdd = curry( add );

        expect( typeof cAdd ).toBe("function");
        expect( typeof cAdd(42) ).toBe("function");
        expect( typeof cAdd(42)(69) ).toBe("number");

        for( let i = 0; i < 10_000; i++ )
        {
            const inputA = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            const inputB = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            expect( add( inputA, inputB ) ).toBe( cAdd( inputA )( inputB ) );
        }

    });

    it("three args functions are curried", () => {

        function add3( a: number, b: number, c: number ): number { return a + b + c };
        const cAdd = curry( add3 );

        expect( typeof cAdd ).toBe("function");
        expect( typeof cAdd(42) ).toBe("function");
        expect( typeof cAdd(42)(69) ).toBe("function");
        expect( typeof cAdd(42)(69)(420) ).toBe("number");

        for( let i = 0; i < 10_000; i++ )
        {
            const inputA = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            const inputB = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            const inputC = ( Math.random() * Number.MAX_SAFE_INTEGER ) - (Number.MAX_SAFE_INTEGER * 0.5);
            expect( add3( inputA, inputB, inputC ) ).toBe( cAdd( inputA )( inputB )(inputC) );
        }

        function ifThenelse<Any>( cond: boolean, b: Any, c: Any ): Any
        {
            return cond ? b : c; 
        };

        const ifNum = (c: boolean, a: number, b: number) => ifThenelse( c, a, b );
        const cif = curry( ifThenelse );

        expect( typeof cif ).toBe("function");
        expect( typeof cif(true) ).toBe("function");
        expect( typeof cif(true)(69) ).toBe("function");
        expect( typeof cif(true)(69)("hello") ).toBe("number");
        expect( typeof cif(false)(69)("hello") ).toBe("string");

        const cifNum = curry( ifNum );
        expect( typeof cifNum ).toBe( "function" );
        expect( typeof cifNum( true ) ).toBe( "function" );
        expect( typeof cifNum( true )( 42 ) ).toBe( "function" );
        expect( typeof cifNum( true )( 42 )( 69 ) ).toBe( "number" );

        expect( typeof cifNum( true )( 42 )( "hello" as any ) ).toBe( "number" );
        expect( typeof cifNum( false )( 42 )( "hello" as any ) ).toBe( "string" ); // due to how ifThenElse itself is defined


    });

    it("rest functions are curried and rest is provided in the last call", () => {

        function addAtLeast2( a: number, b: number , ...rest: number[] ): number
        {
            return rest.reduce( (accum, curr) => accum + curr, a + b );
        }
        const curryAddAtLeast2 = curry( addAtLeast2 );

        expect( typeof curryAddAtLeast2 ).toBe( "function" );
        expect( typeof curryAddAtLeast2( 1 ) ).toBe( "function" );
        expect( typeof curryAddAtLeast2( 1 )( 2 ) ).toBe( "number" );
        expect( typeof curryAddAtLeast2( 1 )( 2, 3 ) ).toBe( "number" );
        expect( curryAddAtLeast2( 1 )( 2 ) ).toBe( 3 );
        expect( curryAddAtLeast2( 1 )( 2 , 3 ) ).toBe( 6 );

        function addMany( ...rest: number[] ): number
        {
            return rest.reduce( (accum, curr) => accum + curr, 0 );
        }
        const curryAddMany = curry( addMany );

        expect( typeof curryAddMany ).toBe( "function" );
        expect( typeof curryAddMany( 1 ) ).toBe( "number" );
        expect( curryAddMany( 1 ) ).toBe( addMany( 1 ) );
        expect( curryAddMany( 1, 2, 3 ) ).toBe( 6 );
    });

})