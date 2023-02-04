import UPLCFlatUtils from ".."
import {BitStream} from "../../../types/bits/BitStream"
import Debug from "../../Debug";


describe( "UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream", () => {

    it( "throws for negatives", () => {

        expect( () =>
            UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                BigInt( -1 )
            )
        ).toThrow();

        expect( () =>
            UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                BigInt( -( 1 << 14  ) )
            )
        ).toThrow();

        expect( () =>
            UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                BigInt( -Number.MAX_SAFE_INTEGER )
            )
        ).toThrow();
        
    })

    it("0 encodes as 0_000_0000", () => {
        
        expect(
            BitStream.eq(
                UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                    BigInt( 0 )
                ),
                BitStream.fromBinStr( "00000000" )
            )
        ).toBe( true );

    });

    it("up to 7 bits are fine", () => {
        
        for( let  i = 1; i < 128; i++ )
        {
            expect(
                BitStream.eq(
                    UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                        BigInt( i )
                    ),
                    BitStream.fromBinStr( i.toString(2).padStart( 8, '0' ) )
                )
            ).toBe( true );
        }

    });
    
    const fstMask = 127;
    const sndMask = 127 << 7;
    const trdMask = 127 << 14;

    it("up to 14 bits are fine", () => {
        
        for( let  i = 128; i <= 0b111_1111_111_1111; i++ )
        {
            expect(
                BitStream.eq(
                    UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                        BigInt( i )
                    ),
                    BitStream.fromBinStr(
                        "1" + (i & fstMask).toString(2).padStart( 7, '0' ) +
                        ( (i & sndMask) >> 7 ).toString(2).padStart( 8, '0' )
                    )
                )
            ).toBe( true );
        }

    });

    it("up to 21 bits are fine", () => {
        
        function chunks3Test( n : number ): void
        {
            expect(
                BitStream.eq(
                    UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                        BigInt( n )
                    ),
                    BitStream.fromBinStr(
                        "1" + (n & fstMask).toString(2).padStart( 7, '0' ) +
                        "1" + ( (n & sndMask) >> 7 ).toString(2).padStart( 7, '0' ) + 
                        ( (n & trdMask) >> 14 ).toString(2).padStart( 8, '0' ) 
                    )
                )
            ).toBe( true );
        }

        chunks3Test( 1 << 14 );
        chunks3Test( 54321 );
        chunks3Test( 1 << 20 );
        chunks3Test( (1 << 21 ) - 1 );

    });
    

})