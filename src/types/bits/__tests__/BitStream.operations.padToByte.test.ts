import BinaryString from "../BinaryString"
import BitStream from "../BitStream"


describe("BitStream.padToByte; default options", () => {

    function pad( toPad: BitStream ): BitStream
    {
        BitStream.padToByte( toPad );
        return toPad;
    }

    it("adds a new byte on byte-alligned BitStreams", () => {

        expect( // pad( empty ) === 0000_0001
            BitStream.eq(
                pad( new BitStream() ),
                BitStream.fromBinStr(
                    new BinaryString( "1".padStart( 8, '0' ) )
                )
            )
        ).toBe( true );

        expect( // pad( 0000_0000 ) === 0000_0000_0000_0001
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "0".padStart( 8, '0' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "1".padStart( 16, '0' ) )
                )
            )
        ).toBe( true );

        expect( // pad( 0000_0001 ) === 0000_0001_0000_0001
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "1".padStart( 8, '0' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "0000000100000001" )
                )
            )
        ).toBe( true );

        expect( // pad( 1111_1111 ) === 1111_1111_0000_0001
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "1".padStart( 8, '1' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "1111111100000001" )
                )
            )
        ).toBe( true );
    })

    it("after padding nMissingBitsToByte is 0", () => {

        const toBePadded: BitStream[] = [
            new BitStream(),
            BitStream.fromBinStr( "0" ),
            BitStream.fromBinStr( "1".padStart( 7, '0' ) ), // 0000_001 -> 0000_0011
            BitStream.fromBinStr( "1".padStart( 6, '0' ) ), // 0000_01  -> 0000_0101
            BitStream.fromBinStr( "1".padStart( 5, '0' ) ), // 0000_1   -> 0000_1001
            BitStream.fromBinStr( "1".padStart( 4, '0' ) ), // 0001     -> 0001_0001
            BitStream.fromBinStr( "1".padStart( 3, '0' ) ), // 001      -> 0010_0001
            BitStream.fromBinStr( "1".padStart( 2, '0' ) ), // 01       -> 0100_0001
            BitStream.fromBinStr( "1" ),                    // 1        -> 1000_0001
        ];

        for( const toPad of toBePadded )
        {
            expect( pad( toPad ).getNBitsMissingToByte() ).toBe(0);
        }
    })
})

describe("BitStream.padToByte; with options", () => {

    it("no final 1 as end padding, adds Byte", () => {

        function pad( toPad: BitStream ): BitStream
        {
            BitStream.padToByte( toPad , { withOneAsEndPadding: false } );
            return toPad;
        }

        expect( // pad( empty ) === 0000_0000
            BitStream.eq(
                pad( new BitStream() ),
                BitStream.fromBinStr(
                    new BinaryString( "0".padStart( 8, '0' ) )
                )
            )
        ).toBe( true );

        expect( // pad( 0000_0000 ) === 0000_0000_0000_0000
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "0".padStart( 8, '0' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "0".padStart( 16, '0' ) )
                )
            )
        ).toBe( true );

        expect( // pad( 0000_0001 ) === 0000_0001_0000_0000
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "1".padStart( 8, '0' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "0000000100000000" )
                )
            )
        ).toBe( true );

        expect( // pad( 1111_1111 ) === 1111_1111_0000_0000
            BitStream.eq(
                pad(
                    BitStream.fromBinStr(
                        new BinaryString( "1".padStart( 8, '1' ) )
                    )
                ),
                BitStream.fromBinStr(
                    new BinaryString( "1111111100000000" )
                )
            )
        ).toBe( true );
    })

})