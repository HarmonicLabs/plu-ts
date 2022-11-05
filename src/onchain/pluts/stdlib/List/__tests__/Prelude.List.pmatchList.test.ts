import { pmatchList } from "../methods"
import evalScript from "../../../../CEK"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import { pmakeUnit } from "../../../PTypes/PUnit"
import { pfn } from "../../../Syntax/syntax"
import Type from "../../../Term/Type/base"


describe("pmatchList", () => {
    
    const elemsT =  Type.Var("elemsT");

    test("different result on nil and cons lists", () => {

        const empty0otherwise42 = pmatchList( Type.Int )
            .$( pInt( 0 ) )
            .$(
                pfn([
                    elemsT,
                    Type.List( elemsT ),
                ],
                    Type.Int
                )(
                    ( x, xs ) => pInt( 42 )
                )
            );
        
        expect(
            evalScript(
                empty0otherwise42.$(
                    pList( Type.Unit )([])
                )
            )
        ).toEqual( evalScript( pInt( 0 ) ) )

        expect(
            evalScript(
                empty0otherwise42.$(
                    pList( Type.Unit )([ pmakeUnit() ])
                )
            )
        ).toEqual( evalScript( pInt( 42 ) ) )

    })
    
})