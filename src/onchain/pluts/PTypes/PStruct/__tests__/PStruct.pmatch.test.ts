import { pgenericStruct, pmatch } from ".."
import { int } from "../../../Term/Type";

const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
});

describe("pmatch", () => {

    test("pmatch( PMaybe(int).Nothing() )", () => {

        const matchNothing: any = pmatch( PMaybe(int).Nothing({}) );
        
        /*
        expect(
            matchNothing
        ).toEqual({
            onJust: matchNothing.onJust,
            onNothing: matchNothing.onNothing
        })
    
        const matchNothingOnJust = matchNothing.onJust( () => {} );

        expect(
            matchNothingOnJust
        ).toEqual({
            onNothing: matchNothingOnJust.onNothing
        })
        
        const matchNothingOnNothing = matchNothing.onNothing( () => {} );
        expect(
            matchNothingOnNothing
        ).toEqual({
            onJust: matchNothingOnNothing.onJust
        })
        //*/
        
        console.log(
            matchNothing
            .onJust( () => {} )
            .onNothing( () => {} )
        )

    })
})