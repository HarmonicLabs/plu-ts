import { pgenericStruct } from "../pstruct"
import { Type, ConstantableTermType, struct } from "../../../Term/Type/base"
import { structExtends } from "../../../Term/Type/extension"


describe("typeofGenericStruct", () => {

    test("single arguent", () => {

        const PMaybeDef = (tyArg: ConstantableTermType) => {
            return {
                Just: { value: tyArg },
                Nothing: {}
            }
        };

        const PMaybe = pgenericStruct( PMaybeDef )

        const PMaybeTermType = PMaybe.type;
        const manualType = struct({
            Just: { value: Type.Var() },
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