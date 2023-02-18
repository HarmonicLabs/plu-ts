import { PTxInInfo } from "../../../../API/V2/Tx/PTxInInfo"
import { data, int, str } from "../../../../type_system"
import { pInt } from "../../int";
import { pStr } from "../../str";
import { pList, pnil } from "../const"

describe("pList", () => {

    test("pList( PTxInInfo.type )([])", () => {
        expect(
            pList( PTxInInfo.type )([])
            .toUPLC(0)
        ).toEqual(
            pnil( data )
            .toUPLC(0)
        )
    });

    test.only("pList( int )( [1,2,3].map( pInt ) )", () => {

        expect(
            () => pList( int )( [1].map( pInt ) ).toUPLC(0)
        ).not.toThrow()

    });

    test.only("pList( str )( [\"hello\",\"world\"].map( pStr ) )", () => {

        expect(
            () => pList( str )( ["hello","world"].map( pStr ) ).toUPLC(0)
        ).not.toThrow();
        
    });
    
})