import { ConstValue, isConstValue, isConstValueList } from ".."
import { Integer, UInteger } from "../../../../../../types/ints/Integer";
import { ByteString } from "../../../../../../types/HexString/ByteString";
import { Pair } from "../../../../../../types/structs/Pair";
import { fromHex } from "@harmoniclabs/uint8array-utils";

describe("ConstValue :: isConstValue, simple values", () => {

    it("is true for undefined (type unit)", () => {

        expect( isConstValue( undefined ) ).toBe( true );
        expect( (isConstValue as any)() ).toBe( true );

    })

    it("is true for strict Integer instances", () => {

        expect( isConstValue( 2 ) ).toBe( true );
        expect( isConstValue( -2 ) ).toBe( true );

        expect( isConstValue( 2 ) ).toBe( true );

    })

    it("is true for strict ByteString instances", () => {

        expect( isConstValue( new ByteString( "abcd" ) ) ).toBe( true );
        expect( isConstValue( new ByteString( fromHex( "abcd" ) ) ) ).toBe( true );

        class SomeExtendedBS extends ByteString {};

        expect( isConstValue( new SomeExtendedBS( "abcd" ) ) ).toBe( false );
        expect( isConstValue( new SomeExtendedBS( fromHex( "abcd" ) ) ) ).toBe( false );

    })

    it("is true for strings", () => {

        expect( isConstValue( "abcd" ) ).toBe( true );
        expect( isConstValue( "" ) ).toBe( true );

    })

    it("is true for booleans", () => {

        expect( isConstValue( true ) ).toBe( true );
        expect( isConstValue( false ) ).toBe( true );

    })

    it("Arrays do match 'isConstValueList'", () => {

        const arrValues: ConstValue[][] = [
            [],
            [ 2 ],
            [ 2, 3 ],

            [
                [ 2, 3 ],
                []
            ],

            [
                [],
                [ 2, 3 ]
            ],

        ];

        for( const arrVal of arrValues)
        {
            expect( isConstValue( arrVal ) ).toBe( isConstValueList( arrVal ) );
        }

        // not true for simple values
        expect( isConstValue( "str" ) ).not.toBe( isConstValueList( "str" ) );
        expect( isConstValue( 2 ) ).not.toBe( isConstValueList( 2 ) );

    })

    it("is true for Pairs of ConstValues", () => {

        expect( 
            isConstValue( new Pair( undefined , undefined ) )
        ).toBe( true );

        expect( 
            isConstValue( new Pair( 2 , undefined ) )
        ).toBe( true );

        expect( 
            isConstValue( new Pair( 2 , 42 ) )
        ).toBe( true );

        expect( 
            isConstValue( new Pair( "str" , new ByteString( "abcd" ) ) )
        ).toBe( true );

    })

    it("is false for Pairs that do contain non ConstValue values", () => {

        expect( 
            isConstValue( new Pair( 2 , {} ) )
        ).toBe( false );

    })

    it.todo("Data do match 'isData'");

})

describe("ConstValue :: isConstValueList", () => {

    it("lists of simple values are true", () => {

        expect(
            isConstValueList([])
        ).toBe(true);

        expect(
            isConstValueList([ undefined ])
        ).toBe(true);
        
        expect(
            isConstValueList([ 2 ])
        ).toBe(true);
        
        expect(
            isConstValueList([ "string" ])
        ).toBe(true);
        
        expect(
            isConstValueList([ new ByteString( "abcd" ) ])
        ).toBe(true);

    })

    it("simple values not in arrays are not list values", () => {

        expect(
            isConstValueList( 2 )
        ).toBe(false);
        
        expect(
            isConstValueList( "string" )
        ).toBe(false);
        
        expect(
            isConstValueList( new ByteString( "abcd" ) )
        ).toBe(false);

    });

    it("lists with incongruent elements are false", () => {

        expect(
            isConstValueList([ 2, "str" ])
        ).toBe(false);
        
        expect(
            isConstValueList([ "string", undefined ])
        ).toBe(false);
        
        expect(
            isConstValueList([ new ByteString( "abcd" ), "abcd" ])
        ).toBe(false);

    });

    it("list of empty list is true (even if type is ambigous)", () => {

        expect(
            isConstValueList([
                [], [], [], []
            ])
        ).toBe( true );

        expect(
            isConstValueList([
                [ [], [] ],
                [],
                [ [] ]
            ])
        ).toBe( true )

    })

    it("list of lists is true only if list types are congruent", () => {

        expect(
            isConstValueList([
                [], [1], [], []
            ])
        ).toBe( true );

        expect(
            isConstValueList([
                [2], // list int
                [1], // ok
                [ undefined ], // incongruent; list unit
                []
            ])
        ).toBe( false );

        expect(
            isConstValueList([
                [], // any list 
                [1], // list int
                [ undefined ], // incongurent
                []
            ])
        ).toBe( false );
        
    })

});