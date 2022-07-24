import { constT, encodeConstTypeToUPLCBitStream } from ".."
import BitStream from "../../../../../../../types/bits/BitStream"


describe("ConstType :: encodeConstTypeToUPLCBitStream", () => {

    it("encodes simple types as single list + 4 bits tag", () => {

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.int
                ),
                BitStream.fromBinStr( "0" + "0000" )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.byteStr
                ),
                BitStream.fromBinStr( "0" + "0001" )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.str
                ),
                BitStream.fromBinStr( "0" + "0010" )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.unit
                ),
                BitStream.fromBinStr( "0" + "0011" )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.bool
                ),
                BitStream.fromBinStr( "0" + "0100" )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.data
                ),
                BitStream.fromBinStr( "0" + "1000" )
            )
        ).toBe( true );

    });

    it("encodes lists as [tyApp, list, ...tyArg]", () => {

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.listOf( constT.int )
                ),
                BitStream.fromBinStr(
                    "1" + "0111" + // cons + tyApp
                    "1" + "0101" + // cons + list
                    "0" + "0000"   // nil + int
                )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.listOf(
                        constT.listOf(
                            constT.int
                        )
                    )
                ),
                BitStream.fromBinStr(
                    "1" + "0111" + // cons + tyApp
                    "1" + "0101" + // cons + list
                    "1" + "0111" + // cons + tyApp
                    "1" + "0101" + // cons + list
                    "0" + "0000"   // nil + int
                )
            )
        ).toBe( true );

    })

    it("encodes pairs as [tyApp, tyApp, pair, ...tyArg1, ...tyArg2]", () => {

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.pairOf( constT.int, constT.bool )
                ),
                BitStream.fromBinStr(
                    "1" + "0111" + // cons + tyApp
                    "1" + "0111" + // cons + tyApp
                    "1" + "0110" + // cons + pair
                    "1" + "0000" + // cons + int
                    "0" + "0100"   // nil + bool
                )
            )
        ).toBe( true );

        expect(
            BitStream.eq(
                encodeConstTypeToUPLCBitStream(
                    constT.pairOf(
                        constT.listOf(
                            constT.int
                        ),
                        constT.int
                    )
                ),
                BitStream.fromBinStr(
                    "1" + "0111" + // cons + tyApp
                    "1" + "0111" + // cons + tyApp
                    "1" + "0110" + // cons + pair
                    "1" + "0111" + // cons + tyApp
                    "1" + "0101" + // cons + list
                    "1" + "0000" + // cons + int
                    "0" + "0000"   // nil + int
                )
            )
        ).toBe( true );

    })
})