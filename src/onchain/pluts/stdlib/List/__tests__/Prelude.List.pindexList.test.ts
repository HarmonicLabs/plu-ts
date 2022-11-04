import { pindexList } from ".."
import Debug from "../../../../../utils/Debug"
import evalScript from "../../../../CEK"
import ErrorUPLC from "../../../../UPLC/UPLCTerms/ErrorUPLC"
import PInt, { pInt } from "../../../PTypes/PInt"
import { pList, pnil } from "../../../PTypes/PList"
import { int } from "../../../Term/Type"


describe("pindexList", () => {

    test("error on empty list", () => {

        const indexOfEmpty = pindexList( int ).$( pnil( int ) ).$( pInt( 0 ) )

        const evalueated = evalScript( indexOfEmpty );

        Debug.log( evalueated );
        expect( evalueated instanceof ErrorUPLC ).toBe( true );

    });

    test("error if index > length - 1", () => {

        const outOfBound = pindexList( int ).$( pList( int )([ 1,2,3,4,5,6,7 ].map( pInt )) ).$( pInt( 10 ) )

        const evalueated = evalScript( outOfBound );

        Debug.log( evalueated );
        expect( evalueated instanceof ErrorUPLC ).toBe( true );

    });

    test("ok if index <= length - 1", () => {


        const fst = pindexList( int ).$( pList( int )([ 1,2,3,4,5,6,7 ].map( pInt )) ).$( pInt( 0 ) )

        const evalueatedFst = evalScript( fst );

        Debug.log( evalueatedFst );
        expect( evalueatedFst instanceof ErrorUPLC ).toBe( false );
        expect( evalueatedFst ).toEqual( evalScript( pInt( 1 ) ) );


        const _4 = pindexList( int ).$( pList( int )([ 1,2,3,4,5,6,7 ].map( pInt )) ).$( pInt( 3 ) )

        const evalueated = evalScript( _4 );

        Debug.log( evalueated );
        expect( evalueated instanceof ErrorUPLC ).toBe( false );
        expect( evalueated ).toEqual( evalScript( pInt( 4 ) ) );



        const last = pindexList( int ).$( pList( int )([ 1,2,3,4,5,6,7 ].map( pInt )) ).$( pInt( 6 ) )

        const evalueatedLast = evalScript( last );

        Debug.log( evalueatedLast );
        expect( evalueatedLast instanceof ErrorUPLC ).toBe( false );
        expect( evalueatedLast ).toEqual( evalScript( pInt( 7 ) ) );

    })


})