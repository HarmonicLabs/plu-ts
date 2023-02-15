import { typeofGenericStruct } from "../pstruct"
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { struct, tyVar } from "../../../type_system/types";
import { typeExtends } from "../../../type_system";


describe("typeofGenericStruct", () => {

    test("single arguent", () => {


        const PMaybeTermType = typeofGenericStruct( PMaybe as any ) as any;
        const manualType = struct({
            Just: { val: tyVar() as any },
            Nothing: {}
        });

        expect(
            typeExtends(
                PMaybeTermType,
                manualType
            )
        ).toBe( true );

        expect(
            typeExtends(
                manualType,
                PMaybeTermType
            )
        ).toBe( true )

    });

})