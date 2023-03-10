import {DataConstr} from "../DataConstr"

describe( "DataConstr", () => {

    it( "throws on negative tags", () => {

        expect( () => new DataConstr( -1 , [] ) ).toThrow();
        expect( () => new DataConstr( -128 , [] ) ).toThrow();
        expect( () => new DataConstr( -Number.MAX_SAFE_INTEGER , [] ) ).toThrow();

    })
})