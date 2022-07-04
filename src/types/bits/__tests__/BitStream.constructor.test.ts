import BitStream from "../BitStream"


describe("new BitStream() is empty", () => {

    const emptyBitStream = new BitStream();

    expect( emptyBitStream.asBigInt() ).toEqual( BigInt( 0 ) );
    expect( emptyBitStream.toBuffer().buffer ).toEqual( Buffer.from( [] ) );

})

describe("BitStream bigint constructor ", () => {

    it("new BitStream( bigint, any number ).asBigInt() is identity", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).asBigInt() ).toBe( _65bits )
        expect( new BitStream( _65bits, 1 ).asBigInt() ).toBe( _65bits )
        expect( new BitStream( _65bits, 8 ).asBigInt() ).toBe( _65bits )
        expect( new BitStream( _65bits, 1000 ).asBigInt() ).toBe( _65bits )

        for( let i = 0; i < 100; i++)
        {
            expect( new BitStream( _65bits, Math.round( Math.random() * 100000 ) ).asBigInt() ).toBe( _65bits )
        }

    })

    it("nInitialZeroes is stored correctly", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).getInitialZeroes() ).toBe( 0 )
        expect( new BitStream( _65bits, 1 ).getInitialZeroes() ).toBe( 1 )
        expect( new BitStream( _65bits, 8 ).getInitialZeroes() ).toBe( 8 )
        expect( new BitStream( _65bits, 1000 ).getInitialZeroes() ).toBe( 1000 )
        
    })

    it("nInitialZeroes is stored correctly", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).getInitialZeroes() ).toBe( 0 )
        expect( new BitStream( _65bits, 1 ).getInitialZeroes() ).toBe( 1 )
        expect( new BitStream( _65bits, 8 ).getInitialZeroes() ).toBe( 8 )
        expect( new BitStream( _65bits, 1000 ).getInitialZeroes() ).toBe( 1000 )
        
    })
})

describe("BitStream buffer constructor ", () => {

    it("new BitStream( buffer [, 0 ]).toBuffer().buffer is identity", () => {

        const buffers = [
            "ff".repeat( 8 ),
            "ff".repeat( 60 ),
            "ff".repeat( 100 )
        ].map( hex => Buffer.from( hex, "hex" ) );

        for( let buff of buffers )
        {
            expect( new BitStream( buff ).toBuffer().buffer ).toEqual( buff )
        }

        for( let buff of buffers )
        {
            expect( new BitStream( buff, 0 ).toBuffer().buffer ).toEqual( buff )
        }

    });

})