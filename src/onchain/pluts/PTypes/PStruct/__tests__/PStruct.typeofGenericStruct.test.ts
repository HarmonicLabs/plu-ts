import { pgenericStruct, typeofGenericStruct } from "../pstruct"
import { Type, ConstantableTermType, struct } from "../../../Term/Type/base"
import { structExtends } from "../../../Term/Type/extension"
import { PMaybe } from "../../../stdlib";
import { termTypeToString } from "../../../Term/Type/utils";


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