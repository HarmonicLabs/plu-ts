import { asData, data, int, list, pair, struct } from "../types"

describe("type creation", () => {

    test("asData", () => {

        expect(
            asData( data )
        ).toEqual( data )

        expect(
            asData( asData( data ) )
        ).toEqual( data )

        expect(
            asData(
                struct({ F: { h: int } })
            )
        ).toEqual(
            struct({ F: { h: int } })
        )

        expect(
            asData(
                pair( int, int )
            )
        ).not.toEqual(
            pair( asData( int ), asData( int ) )
        );

        expect(
            asData(
                list( int )
            )
        ).not.toEqual(
            list( asData( int ) )
        );

    });
})