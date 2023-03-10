import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import {BitStream} from "../BitStream"


describe("new BitStream() is empty", () => {

    const emptyBitStream = new BitStream();

    expect( emptyBitStream.asBigInt().bigint ).toEqual( BigInt( 0 ) );
    expect( emptyBitStream.toBuffer().buffer ).toEqual( new Uint8Array(0) );

})

describe("BitStream bigint constructor ", () => {

    it("new BitStream( bigint, any number ).bits is identity", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).bits ).toBe( _65bits )
        expect( new BitStream( _65bits, 1 ).bits ).toBe( _65bits )
        expect( new BitStream( _65bits, 8 ).bits ).toBe( _65bits )
        expect( new BitStream( _65bits, 1000 ).bits ).toBe( _65bits )

        for( let i = 0; i < 100; i++)
        {
            expect( new BitStream( _65bits, Math.round( Math.random() * 100000 ) ).bits ).toBe( _65bits )
        }

    })

    it("nInitialZeroes is stored correctly", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).nInitialZeroes ).toBe( 0 )
        expect( new BitStream( _65bits, 1 ).nInitialZeroes ).toBe( 1 )
        expect( new BitStream( _65bits, 8 ).nInitialZeroes ).toBe( 8 )
        expect( new BitStream( _65bits, 1000 ).nInitialZeroes ).toBe( 1000 )
        
    })

    it("nInitialZeroes is stored correctly", () => {

        const _65bits = BigInt( 1 ) << BigInt( 64 );

        expect( new BitStream( _65bits ).nInitialZeroes ).toBe( 0 )
        expect( new BitStream( _65bits, 1 ).nInitialZeroes ).toBe( 1 )
        expect( new BitStream( _65bits, 8 ).nInitialZeroes ).toBe( 8 )
        expect( new BitStream( _65bits, 1000 ).nInitialZeroes ).toBe( 1000 )
        
    })
})

describe("BitStream buffer constructor ", () => {

    it("all zeroes buffer", () => {

        const buffers = [
            "00",
            "00".repeat( 8 ),
            "00".repeat( 60 ),
            "00".repeat( 100 )
        ].map( fromHex );

        for( let buff of buffers )
        {
            const { buffer, nZeroesAsEndPadding } = new BitStream( buff ).toBuffer();

            expect( nZeroesAsEndPadding ).toBe( 0 );
            expect( buffer ).toEqual( buff );

        }

    })

    it("new BitStream( buffer [, 0 ]).toBuffer().buffer is identity", () => {

        const buffers = [
            "ff".repeat( 8 ),
            "ff".repeat( 60 ),
            "000da81c6ee58cd141d451bebfec72c24668a7ec207e3ebdec159d1dc22639d2cf7023b6d102a4197390e1d6533d2d3307e74e5fcedbf4be9032b0d56f370b4dd90b74253cc8ba0b467442ddb5aefed729c73f7354dcc981430b9ba1049780af3a4d0ae78520b3303e3137b7bb38d8b4428063f976968bd08e98082dd2166156737326105b5feca2",
            "00b24f4c083f67b748c4c6fd3dccf29247ba67b8918683b6d53591a4d8bdc4186153a46648c6ba888bbb0dd9022095e44dab4256ee9527f97e0795a53aed96705d9148d58fb8e12382a9f051120376c0fe75b71b608b77334f49d984c5329e807aed2d69ced71ebd8ea97cc0ea57195cf3d67535a93a7ec6669409352cec90ea7fed343a2f05c408dafdf655f0b23806bd9715c35b7c9a4e01e832500202e73933bec9e46aa090ab44677ac62f6f154927b2ac313ceef4c2",
        ].map( fromHex );

        for( let buff of buffers )
        {
            const { buffer, nZeroesAsEndPadding } = new BitStream( buff ).toBuffer();
            
            //expect( nZeroesAsEndPadding ).toBe( 0 );
            expect( toHex( buffer ) ).toEqual( toHex( buff ) )
        }

    });

})