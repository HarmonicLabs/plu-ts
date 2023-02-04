import { int } from "../../../Term/Type/base";
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { pStr } from "../../../lib/std/str/pStr";


describe("pgenericStruct", () => {

    test( "throws on wrong type, even if typescript is stupid", () => {
        
        expect( () =>
            PMaybe( int ).Just({ value: pStr("") } as any )
        ).toThrow();

    })

})