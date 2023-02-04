import { typeofGenericStruct } from "../pstruct"
import { Type, struct } from "../../../Term/Type/base"
import { structExtends } from "../../../Term/Type/extension"
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";


describe("typeofGenericStruct", () => {

    test("single arguent", () => {


        const PMaybeTermType = typeofGenericStruct( PMaybe as any );
        const manualType = struct({
            Just: { val: Type.Var() },
            Nothing: {}
        });

        expect(
            structExtends(
                PMaybeTermType,
                manualType
            )
        ).toBe( true );

        expect(
            structExtends(
                manualType,
                PMaybeTermType
            )
        ).toBe( true )

    });

})