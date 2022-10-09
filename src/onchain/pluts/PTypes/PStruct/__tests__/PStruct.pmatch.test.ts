import pstruct, { pgenericStruct, pmatch, PMatchOptions } from ".."
import evalScript from "../../../../CEK";
import { showUPLC } from "../../../../UPLC/UPLCTerm";
import { int, PrimType, str } from "../../../Term/Type";
import { pInt } from "../../PInt";

const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
});

const FixStruct = pstruct({
    A: { _0: int, _1: str },
    B: { _0: int },
    C: {}
})

describe("pmatch", () => {

    test("pmatch(FixStruct.<...>)", () => {

        const matchFixStruct = pmatch( FixStruct.C({}) )
        
    })

    test("pmatch( PMaybe(int).Nothing({}) )", () => {

        const matchNothing = pmatch( PMaybe(int).Nothing({}) );
        
        //*
        expect(
            matchNothing
        ).toEqual({
            onJust: matchNothing.onJust,
            onNothing: matchNothing.onNothing
        })
    
        const matchNothingOnJust = matchNothing.onJust( rawFields => pInt( 0 ) );

        expect(
            matchNothingOnJust
        ).toEqual({
            onNothing: matchNothingOnJust.onNothing
        })
        
        const matchNothingOnNothing = matchNothing.onNothing( rawFields => pInt( 0 ) );
        expect(
            matchNothingOnNothing
        ).toEqual({
            onJust: matchNothingOnNothing.onJust
        })
        //*/
        
        console.log(
            showUPLC(
                matchNothing
                .onNothing( rawFields => pInt( 1 ) )
                .onJust( rawFields => pInt( 0 ) )
                .toUPLC(0)
            )
        )

    })
})