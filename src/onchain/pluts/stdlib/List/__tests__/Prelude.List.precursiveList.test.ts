import { precursiveList } from ".."
import evalScript from "../../../../CEK"
import { pInt } from "../../../PTypes/PInt"
import { pList, pnil } from "../../../PTypes/PList"
import { pStr } from "../../../PTypes/PString"
import { papp, pfn, plam } from "../../../Syntax"
import Type, { int, str } from "../../../Term/Type"


describe("precursiveList", () => {
    
    const elemsT =  Type.Var("elemsT");

    test("different result on nil and cons lists", () => {

        const plength = precursiveList( Type.Int )
            .$(
                plam(
                    Type.Lambda( Type.List( elemsT ), Type.Int ),
                    Type.Int
                )(
                    ( _self ) => pInt( 0 )
                )
            )
            .$(
                pfn([
                    Type.Lambda( Type.List( elemsT ), Type.Int ),
                    elemsT,
                    Type.List( elemsT )
                ],  Type.Int)
                (
                    ( self, _x, xs ) => pInt(1).add.$( papp( self, xs ) )
                )
            )

        expect(
            evalScript(
                plength.$( pnil(int) )
            )
        ).toEqual(
            evalScript(
                pInt( 0 )
            )
        )

        //*
        let arr = [];
        for( let i = 1; i < 6; i++ )
        {
            arr.push(i);
            expect(
                evalScript(
                    plength.$( pList( int )( arr.map( pInt ) ) )
                )
            ).toEqual(
                evalScript(
                    pInt( i )
                )
            )

            expect(
                evalScript(
                    plength.$( pList( str )( arr.map( x => pStr( x.toString() ) ) ) )
                )
            ).toEqual(
                evalScript(
                    pInt( i )
                )
            )
        }
        //*/

    })
    
})