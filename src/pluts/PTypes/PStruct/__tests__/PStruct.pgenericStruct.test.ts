import { toData } from "../../../lib";
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { pStr } from "../../../lib/std/str/pStr";
import { int, str } from "../../../../type_system/types";


describe("pgenericStruct", () => {

    test( "throws on wrong type, even if typescript is stupid", () => {
        
        expect( () =>
            PMaybe( int ).Just({ val: toData( str )( pStr("") ) as any } )
        ).toThrow();

    })

})