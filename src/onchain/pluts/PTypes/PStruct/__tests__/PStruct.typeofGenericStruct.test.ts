import { pgenericStruct } from ".."
import Type, { ConstantableTermType, int, struct, TermType } from "../../../Term/Type"
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

        const PMaybeTermType = PMaybe.termType;
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