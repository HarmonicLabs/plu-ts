import { IRNative } from "../index";

describe("IRNative.hash", () => {

    test("sndPair !== unConstrData", () => {

        expect( IRNative.sndPair.tag )
        .not.toEqual( IRNative.unConstrData.tag );

        expect( IRNative.sndPair.hash )
        .not.toEqual( IRNative.unConstrData.hash );

    });

});