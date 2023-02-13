import { DataB, DataI, DataList, DataMap, DataPair } from "../../../../../../../types/Data"
import { Machine } from "../../../../../../CEK"
import { showUPLC } from "../../../../../../UPLC/UPLCTerm"
import { PTxInInfo } from "../../../../../API/V2/Tx/PTxInInfo"
import { bs, data, int, list, pair } from "../../../../../Term"
import { pListToData } from "../../../../builtins"
import { pByteString } from "../../../bs"
import { pInt } from "../../../int"
import { pList, pnil } from "../../../list/const"
import { pPair } from "../../../pair"
import { pData } from "../../pData"
import { getToDataForType } from "../getToDataTermForType"

describe("getToDataForType", () => {

    test.skip("empty list of struct", () => {

        const received = showUPLC(
            Machine.evalSimple(
                getToDataForType(
                    list( PTxInInfo.type )
                )(
                    pList( PTxInInfo.type )([])
                )
                .toUPLC(0)
            )
        );

        const expected = showUPLC(
            pListToData( data )
            .$( pnil( data ) )
            .toUPLC(0)
        );

        expect(
            received
        ).toEqual(
            expected
        )
    });

    test("list of pairs becomes data map (empty", () => {

        const received = showUPLC(
            Machine.evalSimple(
                getToDataForType(
                    list( pair( int, bs ) )
                )(
                    pList( pair( int, bs ) )([])
                )
                .toUPLC(0)
            )
        );

        const expected = showUPLC(
            Machine.evalSimple(
                pData(
                    new DataMap([])
                )
            )
        );

        expect( received ).toEqual( expected );
    });

    test("list of pairs (data) becomes data map", () => {

        const received = showUPLC(
            Machine.evalSimple(
                getToDataForType(
                    list( pair( data, data ) )
                )(
                    pList( pair( data, data ) )([
                        pPair( data, data )( pData(new DataI(42)), pData(new DataB("caffee")) )
                    ])
                )
                .toUPLC(0)
            )
        );

        const expected = showUPLC(
            Machine.evalSimple(
                pData(
                    new DataMap([
                        new DataPair(
                            new DataI(42),
                            new DataB("caffee")
                        )
                    ])
                )
            )
        );

        expect( received ).toEqual( expected );
    });

    test("list of pairs becomes data map", () => {

        const received = Machine.evalSimple(
                getToDataForType(
                    list( pair( int, bs ) )
                )(
                    pList( pair( int, bs ) )([
                        pPair( int, bs )( pInt(42), pByteString("caffee") )
                    ])
                )
                .toUPLC(0)
            );

        const expected =
            Machine.evalSimple(
                pData(
                    new DataMap([
                        new DataPair(
                            new DataI(42),
                            new DataB("caffee")
                        )
                    ])
                )
            );

        expect( received ).toEqual( expected );

    });

    test("only pair becomes list of length 2 of data", () => {

        const received = showUPLC(
            Machine.evalSimple(
                getToDataForType(
                    pair( int, bs )
                )(
                    pPair( int, bs )( pInt(42), pByteString("caffee") )
                )
                .toUPLC(0)
            )
        )

        const expected = showUPLC(
            Machine.evalSimple(
                pData(
                    new DataList([
                        new DataI(42),
                        new DataB("caffee")
                    ])
                )
            )
        )

        expect( received ).toEqual( expected );


    });

})