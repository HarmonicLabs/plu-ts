import { BinaryString } from "../BinaryString";
import { BitStream } from "../BitStream"

describe("BitStream.fromBinStr ", () => {
    
    it("creates a BitStream of the same length of the string",() => {

        const strs = [
            "",
            "0",
            "1",
            "00000000000",
            "0000001",
            "1000000000000"
        ];

        for( let str of strs )
        {
            expect( 
                BitStream.fromBinStr( new BinaryString( str ) ).length
            ).toBe( str.length );
        }

    })

    it("keeps the bits as described", () => {

        let rawBinStr: string = "";
        let randStrLen: number;
        let bitStream: BitStream;

        for( let i = 0; i < 1000; i++ )
        {
            randStrLen = Math.round( Math.random() * 100 );
            for(let j = 0; j < randStrLen; j++)
            {
                rawBinStr += Math.round( Math.random() ).toString();
            }

            bitStream = BitStream.fromBinStr(
                new BinaryString( rawBinStr )
            )

            let j = 0;
            for( let bit of bitStream )
            {
                expect( bit.asNumber().toString() ).toBe( rawBinStr[j] );
                j++;
            }

            rawBinStr = "";
        }

    })

    it("keeps the bits as described; special case: empty", () => {

        const bitStream = BitStream.fromBinStr(
            new BinaryString( "" )
        )

        expect( bitStream.length ).toBe( 0 );

        let j = 0;
        for( let bit of bitStream )
        {
            expect( bit.asNumber().toString() ).toBe( "should never get here" );
            j++;
        }

        expect( j ).toBe( 0 );

    });

})

test("BitStream.fromBinStr is safe for UPLC tags", () => {

    const UPLCTags = [
        // untyped terms || constants
        "0000",
        "0001",
        "0010",
        "0011",
        "0100",
        "0101",
        "0110",
        "0111",
        // builtins
        "00000",
        "00001",
        "00010",
        "00011",
        "00100",
        "00101",
        "00110",
        "00111",
        "01000",
        "01001",
        "01010",
        "01011",
        "01100",
        "01101",
        "01110",
        "01111",
        "10000",
        "10001",
        "10010",
        "10011",
        "10100",
        "10101",
        "10110",
        "10111",
        "11000",
    ]

    let bitStream: BitStream

    for(let uplcTag of UPLCTags)
    {
        bitStream = BitStream.fromBinStr(
            new BinaryString( uplcTag )
        )

        expect( bitStream.length ).toBe( uplcTag.length );

        let j = 0;
        for( let bit of bitStream )
        {
            expect( bit.asNumber().toString() ).toBe( uplcTag[j] );
            j++;
        }
    }
})