import { int } from "../../../Term/Type/base";
import { pStr } from "../../PString";
import { PMaybe } from "../../../stdlib/PMaybe/PMaybe";


describe("pgenericStruct", () => {

    test( "throws on wrong type, even if typescript is stupid", () => {
        
        expect( () =>
            PMaybe( int ).Just({ value: pStr("") } as any )
        ).toThrow();

    })

})