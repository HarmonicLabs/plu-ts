import { fromAscii, fromHex } from "@harmoniclabs/uint8array-utils";
import { PType } from "../../PType";
import { Term } from "../../Term";
import { TermInt } from "../../lib/std/UtilityTerms/TermInt";
import { PrimType, bs, fn, int, lam, list, pair, str, tyVar } from "../../../type_system/types";
import { padd } from "../builtins/int/padd";
import { pappArgToTerm } from "../pappArg";
import { pfn } from "../pfn";
import { plam } from "../plam";
import { pList, pnil, pPair } from "../std";
import { pBool } from "../std/bool/pBool";
import { pByteString } from "../std/bs/pByteString";
import { pInt } from "../std/int/pInt";
import { pStr } from "../std/str/pStr";
import { pmakeUnit } from "../std/unit/pmakeUnit";
import { evalScript } from "@harmoniclabs/plutus-machine";
import { ByteString } from "@harmoniclabs/bytestring";
import { Pair } from "@harmoniclabs/pair";

function expectScriptToEq( received: Term<PType>, expected: Term<PType> ): void
{
    expect(
        evalScript(
            received
        )
    ).toEqual(
        evalScript(
            expected
        )
    );
}

describe("pappArgToTerm", () => {

    test.skip("only values; must extend any", () => {

        const anyPappArg = ( whatever: any ) => pappArgToTerm( whatever );
        expectScriptToEq(
            anyPappArg( 1 ),
            pInt( 1 )
        );
        
        expectScriptToEq(
            anyPappArg( true ),
            pBool( true )
        );
        
        expectScriptToEq(
            anyPappArg( false ),
            pBool( false )
        );
        
        expectScriptToEq(
            anyPappArg( "deadbeef" ), // hex even length
            pByteString( "deadbeef" )
        );
        
        expectScriptToEq(
            anyPappArg( "caffe" ), // hex odd length
            pStr( "caffe" )
        );
        
        expectScriptToEq(
            anyPappArg( "word" ), // NON-hex any length
            pStr( "word" )
        );
        
        expectScriptToEq(
            anyPappArg( undefined ),
            pmakeUnit()
        );

        expectScriptToEq(
            anyPappArg( null ),
            pmakeUnit()
        );

        expect(
            () => pappArgToTerm( {} as any )
        ).toThrow()

        expect(
            () =>
            // tecnically valid but without
            // a specified `plu-ts` type `pappArgToTerm`
            // can't build `pfn` correctly
            anyPappArg(
                (n: TermInt) => n.add( pInt( 2 ) )
            )
        ).toThrow()

    });

    test("int", () => {

        const pappArgInt = ( n: any ) => pappArgToTerm( n , int );

        expectScriptToEq(
            pappArgInt( 1 ),
            pInt( 1 )
        );

        expectScriptToEq(
            pappArgInt( BigInt(1) ),
            pInt( 1 )
        );

        expect(
            () => pappArgInt( true )
        ).toThrow()

        expect(
            () =>
                // not the correct type
                pappArgInt(
                    (n: TermInt) => n.add( pInt( 2 ) )
                )
        ).toThrow()

    });

    test("bs", () => {

        const pappArgBs = ( n: any ) => pappArgToTerm( n , bs );

        expectScriptToEq(
            pappArgBs( "hello" ), // from ascii
            pByteString( fromAscii( "hello" ) )
        );

        expectScriptToEq(
            pappArgBs( "deadbeef" ), // from hex
            pByteString( fromHex( "deadbeef" ) )
        );

        expectScriptToEq(
            pappArgBs( fromAscii( "deadbeef" ) ), // from ascii even if it is hex
            pByteString( fromAscii( "deadbeef" ) )
        );

        expectScriptToEq(
            pappArgBs( "dead  beef" ), // from ascii because spaces are not hex
            pByteString( fromAscii( "dead  beef" ) )
        );

        expect(
            () => pappArgBs( 1 )
        ).toThrow()

        expect(
            () => pappArgBs( true )
        ).toThrow()

        expect(
            () =>
                // not the correct type
                pappArgBs(
                    (n: TermInt) => n.add( pInt( 2 ) )
                )
        ).toThrow()

    });

    test("fn", () => {

        expectScriptToEq(
            pappArgToTerm(
                ((n: any) => n.add( pInt(2) ) ) as any,
                lam( int, int )
            ),
            plam( int, int )
            ( n => n.add( pInt(2) ))
        );

        expectScriptToEq(
            pappArgToTerm(
                padd,
                fn([ int, int ], int)
            ),
            padd
        );

        expectScriptToEq(
            pappArgToTerm(
                ((a: TermInt, b: TermInt) => padd.$( a ).$( b )) as any,
                fn([ int, int ], int)
            ),
            pfn([ int, int ], int)
            ( (a,b) => padd.$( a ).$( b ) )
        );

        // thi function is
        // totally unnecessary in th real world
        //
        // however it covers the test for real world cases
        expectScriptToEq(
            pappArgToTerm(
                ( (a: TermInt) => plam( int, int )( b =>  padd.$( a ).$( b )) ) as any,
                fn([ int, int ], int)
            ),
            plam( int, lam( int, int) )
            ( a => plam( int, int )(
                b => padd.$( a ).$( b )
            ))
        );

    });

    test("list", () => {

        expectScriptToEq(
            pappArgToTerm<[ PrimType.List, [ PrimType.Int ] ]>(
                [1,2,3]
            ),
            pList( int )( [1,2,3].map( pInt ) )
        );

        expectScriptToEq(
            pappArgToTerm(
                [1,2,3] as any,
                list( int )
            ),
            pList( int )( [1,2,3].map( pInt ) )
        );

        expect(
            () => pappArgToTerm<[ PrimType.List, [ PrimType.Int ] ]>( [1,2,"hello" as any] )
        ).toThrow()

        expect(
            () => pappArgToTerm<[ PrimType.List, [ PrimType.Int ] ]>( [] )
        ).toThrow()

        expectScriptToEq(
            pappArgToTerm( [] as any, list( int ) ),
            pnil( int )
        );

        expect(
            () => pappArgToTerm<[ PrimType.List, any ]>( [], list( tyVar() ) )
        ).toThrow()

        expect(
            () => pappArgToTerm<[ PrimType.List, [ PrimType.Str ] ]>( ["hello"] )
        ).toThrow() // ambigous type

        expect(
            () => pappArgToTerm<[ PrimType.List, [ PrimType.Str ] ]>( ["hello","world"] )
        ).toThrow() // ambigous type

        // here stack overflow
        expectScriptToEq(
            pappArgToTerm(
                ["hello","world"] as any,
                list( str )
            ),
            pList( str )( ["hello","world"].map( pStr ) )
        );

        expectScriptToEq(
            pappArgToTerm(
                ["hello","world"] as any,
                list( bs )
            ),
            pList( bs )( ["hello","world"].map( str =>  pByteString( fromAscii( str ) ) ) )
        );

    });

    test.skip("pair", () => {

        expectScriptToEq(
            pappArgToTerm(
                ["hello","world"] as any,
                pair( bs, bs )
            ),
            pPair( bs, bs )(
                pByteString( ByteString.fromAscii("hello") ),
                pByteString( ByteString.fromAscii("world") )
            )
        );

        expectScriptToEq(
            pappArgToTerm(
                [1,2] as any,
                pair( int, int )
            ),
            pPair( int, int )(
                pInt( 1 ),
                pInt( 2 )
            )
        );

        expectScriptToEq(
            pappArgToTerm(
                [1,"hello"] as any,
                pair( int, bs )
            ),
            pPair( int, bs )(
                pInt( 1 ),
                pByteString( ByteString.fromAscii("hello") )

            )
        );

        expectScriptToEq(
            pappArgToTerm(
                { fst: 1, snd: "hello" } as any,
                pair( int, bs )
            ),
            pPair( int, bs )(
                pInt( 1 ),
                pByteString( ByteString.fromAscii("hello") )
            )
        );

        expectScriptToEq(
            pappArgToTerm(
                new Pair( 1, "hello" ) as any,
                pair( int, bs )
            ),
            pPair( int, bs )(
                pInt( 1 ),
                pByteString( ByteString.fromAscii("hello") )
            )
        );

    });

});