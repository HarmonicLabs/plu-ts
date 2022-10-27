import pstruct, { pgenericStruct } from ".."
import ByteString from "../../../../../types/HexString/ByteString";
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { bs, int, str, unit } from "../../../Term/Type";
import { pByteString } from "../../PByteString";
import { pInt } from "../../PInt";
import { pmakeUnit } from "../../PUnit";
import pmatch from "../pmatch";

const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
});
const SingleCtor = pstruct({
    Ctor : {
        num: int,
        name: bs,
        aUnitCauseWhyNot: unit
    }
})

describe("pmatch", () => {

    test("pmatch( <single constructor> )", () => {

        expect(
            evalScript(
                pmatch( SingleCtor.Ctor({
                    num: pInt( 42 ),
                    name: pByteString( ByteString.fromAscii("Cardano NFTs lmaooooo") ),
                    aUnitCauseWhyNot: pmakeUnit()
                }))
                .onCtor( rawFields => rawFields.extract("num").in( ({ num }) => num ) ) 
            )
        ).toEqual(
            UPLCConst.int( 42 )
        );

    })


    test("two ctors", () => {

        expect(
            evalScript(
                pmatch( PMaybe( int ).Just({ value: pInt(2) }) )
                .onJust( f => f.extract("value").in( v => v.value ) )
                .onNothing( _ => pInt( 0 ) )
            )
        ).toEqual(
            UPLCConst.int( 2 )
        );

    })
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