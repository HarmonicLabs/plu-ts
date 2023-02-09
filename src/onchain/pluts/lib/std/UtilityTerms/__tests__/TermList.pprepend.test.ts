import { Machine } from "../../../../../CEK/Machine"
import { int } from "../../../../Term/Type/base";
import { pInt } from "../../int";
import { pList } from "../../list";

describe("prependTerm", () => {

    test("prepend something", () => {

        expect(
            Machine.evalSimple(
                pList(int)([ pInt(2) ]).prepend( 1 )
            )
        ).toEqual(
            Machine.evalSimple(
                pList(int)([ 1, 2 ].map( pInt ))
            )
        )

    });

    test("prependTerm", () => {

        expect(
            () => pList(int)([ pInt(2) ]).prependTerm
        ).not.toThrow()
        
    })

});