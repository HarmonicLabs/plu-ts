import { TermType, bool, bs, data, delayed, int, lam, list, pair, str, termTypeToString, unit } from "../../../../../../type_system";
import { addUtilityForType } from "../../addUtilityForType";
import { makeMockTerm } from "../makeMockTerm";
import { mockUtilityForType } from "../mockUtilityForType";

function testSameKeys( a: object, b: object ): void
{
    const aKeys = Object.keys( a );
    const bKeys = Object.keys( b );

    expect( aKeys ).toEqual( bKeys );
    expect( aKeys.length ).toEqual( bKeys.length );

    for(let i = 0; i < aKeys.length; i++ )
    {
        expect( aKeys[i] ).toEqual( bKeys[i] );
    }
}

function testType( t: TermType ): void
{
    test(termTypeToString( t ), () => {

        const term = makeMockTerm( t );
        const utility = addUtilityForType( t )( term );
        const mock = mockUtilityForType( t )( term );

        testSameKeys( utility, mock );

    })
}

describe("mockUtilityTerm", () => {

    testType( bool );
    testType( bs );
    testType( int );
    testType( unit );
    testType( str );
    testType( data );
    testType( pair( int, int ) );
    testType( list( int ) );
    testType( list( pair( int, int ) ) );
    testType( lam( int, int ) );
    testType( delayed( int ) );
    
})