import { isGenesisInfos, normalizedGenesisInfos } from "../GenesisInfos";

describe("isGenesisInfos", () => {

    test("deprecated gInfos", () => {
        const gInfos = {
            systemStartPOSIX: 1666656000_000,
            slotLengthInMilliseconds: 1000
        };

        expect( isGenesisInfos( gInfos ) ).toBe( true );

    })
})