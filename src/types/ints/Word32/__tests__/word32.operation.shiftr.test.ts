import Word32 from ".."


describe("Word32 shiftr", () => {

    it("actually shifts the number", () =>{
        const docExample =  new Word32( 0b01011001_00111011_01011000_00000000 );

        expect( docExample.toNumber() ).toBe( 0b01011001_00111011_01011000_00000000 );

        docExample.shiftrAndGetLostBits( 10 );

        expect( docExample.toNumber() ).toBe( 0b00000000_00010110_01001110_11010110 );

        docExample.shiftrAndGetLostBits( 8 );
        
        expect( docExample.toNumber() ).toBe( 0b00000000_00000000_00010110_01001110 )
    })

    it("returns the lostBits as number", () => {

        const docExample =  new Word32( 0b01011001_00111011_01011000_00000000 );

        expect( docExample.shiftrAndGetLostBits( 0 ) ).toBe( 0 );

        // 0b01011001_00111011_01011000_00000000

        expect( docExample.shiftrAndGetLostBits( 10 ) ).toBe( 0 );

        // 0b00000000_00010110_01001110_11010110 );

        expect( docExample.shiftrAndGetLostBits( 8 ) ).toBe( 0b11010110 );

        // 0b00000000_00000000_00010110_01001110

    })
})