import pstruct, { pgenericStruct } from ".."
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { int, str } from "../../../Term/Type";
import { pInt } from "../../PInt";
import pmatch from "../pmatch";

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

    // test(" pmatch(FixStruct.<...>) ", () => {
    //     
    //     const matchFixStruct = pmatch( FixStruct.C({}) )
    //     
    // })

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
        
        expect(
            evalScript(
                matchNothing
                .onNothing( rawFields => pInt( 1 ) )
                .onJust( rawFields => pInt( 0 ) )
                .toUPLC(0)
            )
        ).toEqual( pInt(1).toUPLC(0) )

    });

    test("pmatch with extraction", () => {

        expect(
            evalScript(
                pmatch( PMaybe(int).Just({ value: pInt(42) }) )
                .onJust( rawFields =>
                    rawFields.extract("value")
                    .in( fields => 
                        fields.value
                    )
                )
                .onNothing( _ => pInt( 0 ) )
            )
        ).toEqual(
            UPLCConst.int( 42 )
        );

        expect(
            evalScript(
                pmatch( PMaybe(int).Nothing({}) )
                .onJust( rawFields =>
                    rawFields.extract("value")
                    .in( fields => 
                        fields.value
                    )
                )
                .onNothing( _ => pInt( 0 ) )
            )
        ).toEqual(
            UPLCConst.int( 0 )
        );

    })
})