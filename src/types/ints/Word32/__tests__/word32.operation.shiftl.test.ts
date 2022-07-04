import Word32 from ".."


describe("Word32 shiftl", () => {

    it("actually shifts the number", () =>{
        const docExample =  new Word32( 0b00000000_00010110_01001110_11010110 );

        expect( docExample.toNumber() ).toBe( 0b00000000_00010110_01001110_11010110 );

        docExample.shiftlAndGetLostBits( 10 );

        expect( docExample.toNumber() ).toBe( 0b01011001_00111011_01011000_00000000 );

        docExample.shiftlAndGetLostBits( 8 );
        
        expect( docExample.toNumber() ).toBe( 0b00111011_01011000_00000000_00000000 )
    })

    it("returns the lostBits as number", () => {

        const docExample =  new Word32( 0b00000000_00010110_01001110_11010110 );

        expect( docExample.shiftlAndGetLostBits( 0 ) ).toBe( 0 );

        // 0b00000000_00010110_01001110_11010110

        expect( docExample.shiftlAndGetLostBits( 10 ) ).toBe( 0 );

        // 01011001_00111011_01011000_00000000 ;

        expect( docExample.shiftlAndGetLostBits( 8 ) ).toBe( 0b01011001 );

        // 00111011_01011000_00000000_00000000

    })
})