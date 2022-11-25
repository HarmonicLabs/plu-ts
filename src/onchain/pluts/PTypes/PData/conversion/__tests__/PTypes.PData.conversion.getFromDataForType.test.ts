import { getFromDataForType } from "../getFromDataTermForType"
import PValue from "../../../../API/V1/Value/PValue"

describe("getFromDataForType", () => {

    test("PValue", () => {
        
        expect(
            () => getFromDataForType( PValue.type )
        ).not.toThrow();

    })

})