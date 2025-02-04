import { pList } from "../../pluts";
import { PScriptPurpose } from "../../pluts/API/V3/ScriptContext/PScriptPurpose";
import { PrimType, asData, data, int, list, pair, struct } from "../types"

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
                pair( int, int )
            )
        ).toEqual(
            [ PrimType.AsData, pair( int, int ) ]
        );

        expect(
            asData(
                list( int )
            )
        ).not.toEqual(
            list( asData( int ) )
        );

        expect(
            asData(
                pList( pair( PScriptPurpose.type, data ) )([]).type
            )
        ).toEqual(
            [
                PrimType.AsData,
                list( pair( PScriptPurpose.type, data ) )
            ]
        )

    });
})