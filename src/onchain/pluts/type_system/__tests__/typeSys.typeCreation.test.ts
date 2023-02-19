import { PScriptPurpose } from "../../API/V1/ScriptContext/PScriptPurpose";
import { pList } from "../../lib/std/list/const";
import { PrimType, asData, data, int, list, pair, struct } from "../types"
import { termTypeToString } from "../utils";

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