import { eqCEKValue } from ".."
import { ByteString } from "../../../..";
import DataB from "../../../../types/Data/DataB";
import DataConstr from "../../../../types/Data/DataConstr";
import HoistedUPLC from "../../../UPLC/UPLCTerms/HoistedUPLC"
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst"

describe("eqCEKValue", () => {

    test("hoisted uplcs", () => {

        const hoisted2 = new HoistedUPLC(
            UPLCConst.int( 2 )
        );

        expect(
            eqCEKValue(
                hoisted2,
                new HoistedUPLC(
                    UPLCConst.int( 2 )
                )
            )
        ).toBe( true );

        expect(
            eqCEKValue(
                hoisted2,
                hoisted2.clone()
            )
        ).toBe( true );

        expect(
            eqCEKValue(
                hoisted2.clone(),
                hoisted2
            )
        ).toBe( true );

        expect(
            eqCEKValue(
                hoisted2.clone(),
                hoisted2.clone()
            )
        ).toBe( true );

        expect(
            eqCEKValue(
                hoisted2,
                hoisted2
            )
        ).toBe( true );

        expect(
            eqCEKValue(
                hoisted2,
                new HoistedUPLC(
                    UPLCConst.int( 1 )
                )
            )
        ).toBe( false );
    });

    describe("UPLCConst", () => {
        
        test("data", () => {

            expect(
                eqCEKValue(
                    UPLCConst.data(
                        new DataConstr(
                            0, []
                        )
                    ),
                    UPLCConst.data(
                        new DataConstr(
                            0, []
                        )
                    )
                )
            ).toBe( true );
            
            expect(
                eqCEKValue(
                    UPLCConst.data(
                        new DataConstr(
                            0, [
                                new DataB( ByteString.fromAscii("hello there") )
                            ]
                        )
                    ),
                    UPLCConst.data(
                        new DataConstr(
                            0, [
                                new DataB( ByteString.fromAscii("hello there") )
                            ]
                        )
                    )
                )
            ).toBe( true );

            const someData = UPLCConst.data(
                new DataConstr(
                    0, [
                        new DataB( ByteString.fromAscii("hello there") )
                    ]
                )
            );

            expect(
                eqCEKValue(
                    someData,
                    someData.clone()
                )
            ).toBe( true );

        });

    });

})