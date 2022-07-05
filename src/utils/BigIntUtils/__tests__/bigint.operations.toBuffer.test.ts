import BigIntUtils from ".."


describe("BigIntUtils.toBuffer", () => {

    it("converts entirely on only bigint as input", () => {

        expect( 
            BigIntUtils.toBuffer( BigInt( 0xffff ) ).toString( "hex" )
        ).toBe( "ffff" )

        expect( 
            BigIntUtils.toBuffer( BigInt( 0xfffff ) ).toString( "hex" )
        ).toBe( "0fffff" )

    })

    it("pads with zeroes if required buffer size is not met", () => {

        expect( 
            BigIntUtils.toBuffer( 
                BigInt( 0xffff ), 10 
            ).toString( "hex" )
        ).toBe( "0000000000000000ffff" )

        expect( 
            BigIntUtils.toBuffer( 
                BigInt( 0xfffff ), 10
            ).toString( "hex" )
        ).toBe( "000000000000000fffff"  )
        
    })

    it("truncates the left-most part of the buffer (bigint) if requred buffer size is less than actual size", () => {

        console.log( "next 3 \"console.warn\" calls are expected");
        expect( 
            BigIntUtils.toBuffer( 
                BigInt( 0xffff ), 0
            ).toString( "hex" )
        ).toBe( "" );

        expect( 
            BigIntUtils.toBuffer( 
                BigInt( 0xffff ), 1 
            ).toString( "hex" )
        ).toBe( "ff" );

        expect( 
            BigIntUtils.toBuffer( 
                BigInt( 0xfffff ), 2
            ).toString( "hex" )
        ).toBe( "ffff"  );

    })

    it("throws on negative required byte-length", () => {

        expect( 
            () => BigIntUtils.toBuffer( 
                BigInt( 0xffff ), -1
            ).toString( "hex" )
        ).toThrow();

    })

    it("throws on non integer required byte-length", () => {

        expect( 
            () => BigIntUtils.toBuffer( 
                BigInt( 0xffff ), Math.PI
            ).toString( "hex" )
        ).toThrow();

    })
})