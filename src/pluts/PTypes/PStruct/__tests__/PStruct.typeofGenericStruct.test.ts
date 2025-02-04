import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { struct, tyVar } from "../../../../type_system/types";
import { termTypeToString, typeExtends } from "../../../../type_system";
import { typeofGenericStruct } from "../pgenericStruct";


describe("typeofGenericStruct", () => {

    test("single arguent", () => {

        const PMaybeTermType = typeofGenericStruct( PMaybe as any ) as any;
        const manualType = struct({
            Just: { val: tyVar() as any },
            Nothing: {}
        });


        expect(
            termTypeToString( PMaybeTermType )
        )
        .toEqual(
            termTypeToString( manualType )
        )

    });

})