import { pmatchList } from "../methods"
import { evalScript } from "../../../../CEK"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import { pmakeUnit } from "../../../PTypes/PUnit"
import { pfn } from "../../../Syntax/syntax"
import { Type, unit } from "../../../Term/Type/base"


describe("pmatchList", () => {
    
    test("different result on nil and cons lists", () => {

        const empty0otherwise42 = pmatchList( Type.Int, unit )
            .$( pInt( 0 ) )
            .$(
                pfn([
                    unit,
                    Type.List( unit ),
                ],
                    Type.Int
                )(
                    ( x, xs ) => pInt( 42 )
                )
            );
        
        expect(
            evalScript(
                empty0otherwise42.$(
                    pList( unit )([])
                )
            )
        ).toEqual( evalScript( pInt( 0 ) ) )

        expect(
            evalScript(
                empty0otherwise42.$(
                    pList( unit )([ pmakeUnit() ])
                )
            )
        ).toEqual( evalScript( pInt( 42 ) ) )

    })
    
})