import { precursiveList } from "../methods"
import evalScript from "../../../../CEK"
import { pInt } from "../../../PTypes/PInt"
import { pList, pnil } from "../../../PTypes/PList"
import { pStr } from "../../../PTypes/PString"
import { papp, pfn, plam } from "../../../Syntax/syntax"
import Type, { ConstantableTermType, int, str } from "../../../Term/Type/base"
import { plength } from "../plength"


describe("precursiveList", () => {
    
    test("different result on nil and cons lists", () => {

        expect(
            evalScript(
                plength( int ).$( pnil(int) )
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
                    plength( int ).$( pList( int )( arr.map( pInt ) ) )
                )
            ).toEqual(
                evalScript(
                    pInt( i )
                )
            )

            expect(
                evalScript(
                    plength( str ).$( pList( str )( arr.map( x => pStr( x.toString() ) ) ) )
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