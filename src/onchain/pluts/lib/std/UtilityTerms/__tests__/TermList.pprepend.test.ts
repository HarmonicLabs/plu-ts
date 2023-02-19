import { Machine } from "../../../../../CEK/Machine"
import { showUPLC } from "../../../../../UPLC/UPLCTerm";
import { int } from "../../../../type_system/types";
import { pInt } from "../../int";
import { pList } from "../../list";

describe("prependTerm", () => {

    test("prepend something", () => {

        const uplc = pList(int)([ pInt(2) ]).prepend( 1 ).toUPLC(0);

        const res = Machine.evalSimple( uplc );

        expect(
            res
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