import { pgenericStruct } from "..";
import { Params } from "../../../../../utils/ts";
import { int } from "../../../Term/Type";
import { pStr } from "../../PString";


describe("pgenericStruct", () => {

    const maybeStructGetDescriptor: Params<typeof pgenericStruct>[0] = ( ty ) => {
        return {
            Just: { value: ty },
            Nothing: {}
        };
    };

    test("on same type parameters returns the exact same constructor", () => {

        const PMaybe1 = pgenericStruct( maybeStructGetDescriptor );
        const PMaybe2 = pgenericStruct( maybeStructGetDescriptor );
    
        expect( PMaybe1 === PMaybe2 ).toBe( false );
        expect( PMaybe1 === PMaybe1 ).toBe( true );
        expect( PMaybe2 === PMaybe2 ).toBe( true );

        expect( PMaybe1( int ) === PMaybe1( int ) ).toBe( true );
        expect( PMaybe1( int ) === PMaybe2( int ) ).toBe( false );
    });

    test( "throws on wrong type, even if typescript is stupid", () => {
        
        const PMaybe = pgenericStruct(( ty ) => {
            return {
                Just: { value: ty },
                Nothing: {}
            };
        });

        expect( () =>
            PMaybe( int ).Just({ value: pStr("") })
        ).toThrow();

    })

})