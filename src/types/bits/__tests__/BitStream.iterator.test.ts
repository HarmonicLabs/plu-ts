import BigIntUtils from "../../../utils/BigIntUtils";
import Debug from "../../../utils/Debug";
import Bit from "../Bit";
import BitStream from "../BitStream";


function bitsArrFromString( bitsStr: string ): Bit[]
{
    return bitsStr.split('').map( 
        bitChar => new Bit( bitChar === '0' ? 0 : 1 )
    );
}

describe("BitStream[Symbol.iterator]", () => {

    it("general test", () => {

        let bint: bigint;
        let nInitialZeroes: number;
        let bitStream: BitStream;

        for( let i = 0; i < 1000; i++ )
        {
            bint = BigIntUtils.random();
            nInitialZeroes = Math.round(
                Math.random() * 100
            );
            
            bitStream = new BitStream(
                bint,
                nInitialZeroes
            )

            const bitArr = bitsArrFromString(
                '0'.repeat( nInitialZeroes ) +
                ( bint === BigInt( 0 ) ? '' : bint.toString(2) )
            )

            let streamLength = 0;

            //@ts-ignore Type 'BitStream' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher
            for( let bit of bitStream )
            {
                expect( bit.asNumber() ).toEqual( bitArr[streamLength].asNumber() );
                streamLength++;
            }

            expect( streamLength ).toBe( bitStream.length );
        }
    });

    it("can access single bit trough the 'at' method from Indexable interface", () => {

        const bStream = new BitStream( BigInt( 0b1111_1111 ) )

        let nBits = 0;
        for( ; nBits < bStream.length; nBits++ )
        {
            expect( bStream.at( nBits ).asNumber() ).toBe( 1 );
        }

        expect( nBits ).toBe( 8 );
    })

})