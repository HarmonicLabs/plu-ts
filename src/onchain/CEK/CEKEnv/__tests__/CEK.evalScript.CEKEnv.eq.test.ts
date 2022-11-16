import CEKHeap from "../../CEKHeap";
import CEKEnv  from "..";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";

describe("CEKEnv.eq", () => {

    test("empty env", () => {

        const heap = new CEKHeap();

        expect(
            CEKEnv.eq(
                new CEKEnv( heap ),
                new CEKEnv( heap )
            )
        ).toBe( true );

        const heap2 = new CEKHeap();

        expect(
            CEKEnv.eq(
                new CEKEnv( heap ),
                new CEKEnv( heap2 )
            )
        ).toBe( false );

    });

    test("one var env", () => {

        const heap = new CEKHeap();

        const env1 = new CEKEnv( heap );
        const env2 = new CEKEnv( heap );

        expect(
            CEKEnv.eq( env1, env2 )
        ).toBe( true );

        env1.push( UPLCConst.int( 1 ) );

        expect(
            CEKEnv.eq( env1, env2 )
        ).toBe( false );

        env2.push( UPLCConst.int( 1 ) );

        expect(
            CEKEnv.eq( env1, env2 )
        ).toBe( true );

        expect(
            (heap as any)._heap.length
        ).toBe( 1 );

        const env3 = new CEKEnv( heap );
        env3.push( UPLCConst.int(2) );

        expect(
            CEKEnv.eq( env1, env3 )
        ).toBe( false )

        expect(
            (heap as any)._heap.length
        ).toBe( 2 );

    });

    test("2 vars env", () => {

        const heap = new CEKHeap();

        const env1 = new CEKEnv( heap );
        const env2 = new CEKEnv( heap );
        const env3 = new CEKEnv( heap );

        const _1 = UPLCConst.int( 1 );
        const _2 = UPLCConst.int( 2 );

        env1.push( _1 );
        env2.push( _2 );
        env3.push( _1 );

        expect(
            CEKEnv.eq( env1, env2 )
        ).toBe( false );

        expect(
            CEKEnv.eq( env1, env3 )
        ).toBe( true );

        env1.push( _2 );
        env2.push( _1 );
        env3.push( _2 );

        expect(
            CEKEnv.eq( env1, env2 )
        ).toBe( false );

        expect(
            CEKEnv.eq( env1, env3 )
        ).toBe( true );

        const env4 = new CEKEnv( heap, [ 1, 0 ] );
        const env5 = new CEKEnv( heap );
        env5.push( _2 );
        env5.push( _1 );

        expect(
            CEKEnv.eq( env2, env4 )
        ).toBe( true );

        expect(
            CEKEnv.eq( env5, env4 )
        ).toBe( true );

        expect(
            CEKEnv.eq( env2, env5 )
        ).toBe( true );

    })

});