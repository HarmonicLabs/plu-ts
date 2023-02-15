import { showUPLC } from "../../../../../UPLC/UPLCTerm"
import { PTxInInfo } from "../../../../API/V2/Tx/PTxInInfo"
import { data } from "../../../../type_system"
import { pList, pnil } from "../const"

describe("pList", () => {

    test("pList( PTxInInfo.type )([])", () => {
        expect(
            showUPLC(
                pList( PTxInInfo.type )([])
                .toUPLC(0)
            )
        ).toEqual(
            showUPLC(
                pnil( data )
                .toUPLC(0)
            )
        )
    })
})