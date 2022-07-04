import Word32 from ".."
import BufferUtils from "../../../../utils/BufferUtils";
import Debug from "../../../../utils/Debug";
import JsRuntime from "../../../../utils/JsRuntime";


describe( "Word32 constructor", () => {

    it("succeeds on singed int32 numbers", () => {
        JsRuntime.setSilent();
        
        expect( () => new Word32( 42 ) ).not.toThrow();
        expect( () => new Word32( -42 ) ).not.toThrow();

        expect( () => new Word32( 0b11111111_11111111_11111111_11111111 ) ).toThrow();
        expect( () => new Word32( 0b11111111_11111111_11111111_11111111 | 0 ) ).not.toThrow();
     
        JsRuntime.unsetSilent()
    })

    it("fails on decimals", () => {
        JsRuntime.setSilent();

        expect( () => new Word32( 2.5 ) ).toThrow();
        expect( () => new Word32( Math.PI ) ).toThrow();

        JsRuntime.unsetSilent()
    })

    it("fails on signed integers greater than 2^31 - 1", () => {
        JsRuntime.setSilent();

        expect( () => new Word32( Math.pow( 2, 31 ) - 1 ) ).not.toThrow();
        expect( () => new Word32( Math.pow( 2, 31 ) ) ).toThrow();

        expect( () => new Word32( Number.MAX_SAFE_INTEGER ) ).toThrow();
        
        JsRuntime.unsetSilent()
    })
    
    it("fails on signed integers smaller than -(2^31)", () => {
        JsRuntime.setSilent();
        
        expect( () => new Word32( -Math.pow( 2, 31 ) ) ).not.toThrow();
        expect( () => new Word32( -Math.pow( 2, 31 ) -1 ) ).toThrow();

        expect( () => new Word32( Number.MIN_SAFE_INTEGER ) ).toThrow();
    
        JsRuntime.unsetSilent()
    })

})



describe( "Word32.fromBuffer", () => {

    it("works on <= 4 bytes buffers", () => {

        const emptyBuffer = Buffer.from( [] );
        const bufferOf32Zeroes = Buffer.from( [0,0,0,0] );

        expect( () => Word32.fromBuffer( emptyBuffer ) ).not.toThrow();
        
        expect( 

            Word32.fromBuffer( emptyBuffer )
            .asBuffer().toString( "hex" ) 

        ).toEqual( 
            bufferOf32Zeroes.toString( "hex" ) 
        );
    

        expect(
            Word32.fromBuffer(
                BufferUtils.fromHex(
                    "aabb"
                )
            ).asBuffer().toString( "hex" )
        ).toBe( "0000aabb" );

        expect(
            Word32.fromBuffer(
                BufferUtils.fromHex(
                    "aabbcc"
                )
            ).asBuffer().toString( "hex" )
        ).toBe( "00aabbcc" );

        expect(
            Word32.fromBuffer(
                BufferUtils.fromHex(
                    "aabbccdd"
                )
            ).asBuffer().toString( "hex" )
        ).toBe( "aabbccdd" );


    });

    it("truncates > 4 bytes buffers", () => {

        Debug.overrideDebugForNChecks( 3 , false );

        const bufferOf32Zeroes = Buffer.from( [0,0,0,0] );
        const bufferOf40Zeroes = Buffer.from( [0,0,0,0,0] );

        // debug check
        expect( () => Word32.fromBuffer( bufferOf40Zeroes ) ).not.toThrow();
        
        expect( 
            // debug check
            Word32.fromBuffer( bufferOf40Zeroes )
            .asBuffer().toString( "hex" ) 
        ).toEqual( 
            bufferOf32Zeroes.toString( "hex" ) 
        );

        expect(
            // debug check
            Word32.fromBuffer(
                BufferUtils.fromHex(
                    "ffffffffaa"
                )
            ).asBuffer().toString("hex")
        ).toBe("ffffffff")
        
    });

})