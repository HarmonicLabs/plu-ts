import { showUPLC } from "../../../../../../UPLC/UPLCTerm"
import { PTxInInfo } from "../../../../../API/V2/Tx/PTxInInfo"
import { data, list } from "../../../../../Term"
import { pListToData } from "../../../../builtins"
import { pList, pnil } from "../../../list/const"
import { getToDataForType } from "../getToDataTermForType"

describe("getToDataForType", () => {

    test("empty list of struct", () => {

        const received = showUPLC(
            getToDataForType(
                list( PTxInInfo.type )
            )(
                pList( PTxInInfo.type )([])
            )
            .toUPLC(0)
        );

        const expected = showUPLC(
            pListToData( data )
            .$( pnil( data ) )
            .toUPLC(0)
        );

        expect(
            received
        ).toEqual(
            expected
        )
    })
})