import Debug from "../../../utils/Debug";
import Pair from "../../structs/Pair";
import BinaryString from "../BinaryString"
import BitStream from "../BitStream"


describe("BitStream.eq; equality properties", () => {

    it("is true on same bits", () => {

        const bStreamsPairs: Pair<BitStream,BitStream>[] = [
            new Pair( new BitStream(), new BitStream() ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0" ) ),
                BitStream.fromBinStr( new BinaryString( "0" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1" ) ),
                BitStream.fromBinStr( new BinaryString( "1" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 8 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 8 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) )
            )
        ];

        for( const bStreamPair of bStreamsPairs )
        {
            const { fst, snd } = bStreamPair.asObj();

            expect( BitStream.eq( fst, snd ) ).toBe( true );
        }

    })

    it(("is false on different bits"), () => {
        
        const bStreamsPairs: Pair<BitStream,BitStream>[] = [
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0" ) ),
                BitStream.fromBinStr( new BinaryString( "1" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 38 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padEnd( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padEnd( 34 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padEnd( 34 , '1' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padEnd( 34 , '1' ) ) )
            ),
        ];

        for( const bStreamPair of bStreamsPairs )
        {
            const { fst, snd } = bStreamPair.asObj();

            expect( BitStream.eq( fst, snd ) ).toBe( false );
        }

    })

    it("reflexive (a == a)", () => {

        const bStreams: BitStream[] = [
            new BitStream(),
            BitStream.fromBinStr( new BinaryString( "0" ) ),
            BitStream.fromBinStr( new BinaryString( "1" ) ),
            BitStream.fromBinStr( new BinaryString( "0000000000000" ) ),
            BitStream.fromBinStr( new BinaryString( "0010101" ) ),
        ];

        for( const bStream of bStreams )
        {
            // same reference
            expect( BitStream.eq( bStream, bStream ) ).toBe( true );
            // same values
            expect( BitStream.eq( bStream, bStream.clone() ) ).toBe( true );
        }

    });

    it("symmetric ((a == b) => (b == a))", () => {

        const bStreamsPairs: Pair<BitStream,BitStream>[] = [
            new Pair( new BitStream(), new BitStream() ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0" ) ),
                BitStream.fromBinStr( new BinaryString( "0" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0" ) ),
                BitStream.fromBinStr( new BinaryString( "1" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1" ) ),
                BitStream.fromBinStr( new BinaryString( "1" ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 8 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 8 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 38 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padStart( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padEnd( 34 , '0' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padEnd( 34 , '0' ) ) )
            ),
            new Pair(
                BitStream.fromBinStr( new BinaryString( "1".padEnd( 34 , '1' ) ) ),
                BitStream.fromBinStr( new BinaryString( "0".padEnd( 34 , '1' ) ) )
            ),
        ];

        for( const bStreamPair of bStreamsPairs )
        {
            const { fst, snd } = bStreamPair.asObj();

            expect( BitStream.eq( fst, snd ) ).toBe(  BitStream.eq( snd, fst )  );
        }

    });

    it("transitive (a == b) && (b == c) => (a == c)", () => {

        const bStreamsTriplets: [ BitStream,BitStream, BitStream ][] = [
            new Array(3).fill(
                new BitStream()
            ) as [ BitStream,BitStream, BitStream ],

            new Array(3).fill(
                BitStream.fromBinStr( new BinaryString( "0" ) )
            ) as [ BitStream,BitStream, BitStream ],

            new Array(3).fill(
                BitStream.fromBinStr( new BinaryString( "1" ) )
            ) as [ BitStream,BitStream, BitStream ],

            new Array(3).fill(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 8 , '0' ) ) )
            ) as [ BitStream,BitStream, BitStream ],

            new Array(3).fill(
                BitStream.fromBinStr( new BinaryString( "0".padStart( 34 , '0' ) ) )
            ) as [ BitStream,BitStream, BitStream ],
            
        ];

        for( const bStreams of bStreamsTriplets )
        {
            const [ a, b, c ] = bStreams;

            expect( BitStream.eq( a, b ) ).toBe( true );
            expect( BitStream.eq( b, c ) ).toBe( true );
            expect( BitStream.eq( a, c ) ).toBe( true );
        }

    })

})