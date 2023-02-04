import { evalScript } from "../../../../CEK"
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst"
import { pList, pnil } from "../../../PTypes"
import { pInt } from "../../../PTypes/PInt"
import { papp, pfn, plam } from "../../../Syntax/syntax"
import { bool, ConstantableTermType, int, lam, list } from "../../../Term/Type"
import { pif, pmod, pprepend, psub } from "../../Builtins"
import { pfoldr } from "../methods"


describe("pfoldr", () => {

    const arr = (new Array(10))
    .fill( undefined )
    .map((_, i) => i + 1 );

    test("foldr (-) 0 [1..10] = -5; right associative", () => {

        const expr = pfoldr( int, int )
        .$( psub )
        .$( pInt( 0 ) )
        .$(
            pList( int )( arr.map( pInt ) )
        );

        expect(
            evalScript(
                expr
            )
        ).toEqual(
            UPLCConst.int(
                1-(2-(3-(4-(5-(6-(7-(8-(9-(10 - 0)))))))))
            )
        )
    });

    test("pfilter from pfoldr", () => {

        function _pfilter<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
        {
            return pfn([
                lam( elemsT, bool ),
                list( elemsT )
            ],  list( elemsT ))
            (( predicate, lst ) => 
                pfoldr( elemsT, list( elemsT ) )
                .$( pfn([
                    elemsT,
                    list(elemsT)
                ],  list( elemsT ))
                (( elem, accum ) =>
                    pif( list( elemsT ) ).$( papp( predicate, elem ) )
                    .then( pprepend( elemsT ).$( elem ).$( accum ) )
                    .else( accum )                    
                ))
                .$( pnil( elemsT ) )
                .$( lst )
            )
        };

        const intList = pList( int )( arr.map( pInt ) );

        expect(
            evalScript(
                _pfilter( int )
                .$( plam( int, bool )
                    ( n => pmod.$( n ).$( pInt(2) ).eq( pInt(0) ) )
                )
                .$( intList )
            )
        ).toEqual(
            evalScript(
                pList( int )(
                    arr.filter( n => (n % 2) === 0 ).map( pInt )
                )
            )
        )

        expect(
            evalScript(
                _pfilter( int )
                .$( plam( int, bool )
                    ( n => pmod.$( n ).$( pInt(2) ).eq( pInt(1) ) )
                )
                .$( intList )
            )
        ).toEqual(
            evalScript(
                pList( int )(
                    arr.filter( n => (n % 2) === 1 ).map( pInt )
                )
            )
        )

    })

})