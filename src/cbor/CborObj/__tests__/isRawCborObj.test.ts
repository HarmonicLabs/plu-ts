import { isRawCborObj } from "..";
import { fromHex } from "@harmoniclabs/uint8array-utils";


describe( "isRawCborObj", () => {

    it("is false for non (strict) objects", () => {

        expect( isRawCborObj( 0 as any ) ).toBe( false );
        expect( isRawCborObj( 42 as any ) ).toBe( false );
        expect( isRawCborObj( -42 as any ) ).toBe( false );
        expect( isRawCborObj( true as any ) ).toBe( false );
        expect( isRawCborObj( false as any ) ).toBe( false );
        expect( isRawCborObj( Math.E as any ) ).toBe( false );
        expect( isRawCborObj( Math.PI as any ) ).toBe( false );

        expect( isRawCborObj( undefined as any ) ).toBe( false );

        expect( isRawCborObj( null as any ) ).toBe( false );
        expect( isRawCborObj( [] as any ) ).toBe( false );
        expect( isRawCborObj( [ "has 1 key" ] as any ) ).toBe( false );

        expect( isRawCborObj( (() => {}) as any ) ).toBe( false );
        expect( isRawCborObj( (function() {}) as any ) ).toBe( false );

    });

    it("is false for generic objects", () => {

        expect( isRawCborObj( {} as any ) ).toBe( false );
        expect( isRawCborObj( { something: "useless" } as any ) ).toBe( false );

    });

    it( "uint objects are true if correct value", () => {

        expect(
            isRawCborObj({
                uint: BigInt( 0 )
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                uint: BigInt( 2 )
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                uint: -BigInt( 2 )
            })
        ).toBe( false );

    })

    it( "neg objects are true if correct value", () => {

        expect(
            isRawCborObj({
                neg: BigInt( 0 )
            })
        ).toBe( false );

        expect(
            isRawCborObj({
                neg: BigInt( 2 )
            })
        ).toBe( false );

        expect(
            isRawCborObj({
                neg: -BigInt( 2 )
            })
        ).toBe( true );

    })

    it( "bytes objects are true if correct value", () => {

        expect(
            isRawCborObj({
                bytes: new Uint8Array(0)
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                bytes: fromHex( "deadbeef" )
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                bytes: "deadbeef" as any
            })
        ).toBe( false );

        expect(
            isRawCborObj({
                bytes: new Uint8Array([ 1, 2, 3, 4 ]) as any
            })
        ).toBe( true );

    })

    it( "text objects are true if correct value", () => {

        expect(
            isRawCborObj({
                text: "hello there"
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                text: "deadbeef"
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                text: 30 as any
            })
        ).toBe( false );

    })

    it( "array objects are true if correct value", () => {

        expect(
            isRawCborObj({
                array: []
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                array: [
                    { uint: BigInt( 1 ) },
                    { neg: BigInt( -1 ) }
                ]
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                array: [ 1, -1 ] as any
            })
        ).toBe( false );

        expect(
            isRawCborObj({
                array: "hello there" as any
            })
        ).toBe( false );

    })

    it( "map objects are true if correct value", () => {

        expect(
            isRawCborObj({
                map: []
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                map: [
                    {
                        k: { text: "key" },
                        v: { uint: BigInt( 1 ) }
                    }
                ]
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                map: [
                    {
                        k: "key",
                        v: BigInt( 1 )
                    } as any
                ]
            })
        ).toBe( false );

        expect(
            isRawCborObj({
                map: "hello there" as any
            })
        ).toBe( false );

    })

    it( "simple objects are true if correct value", () => {

        expect(
            isRawCborObj({
                simple: true
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: 2
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: 2.5
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: Math.PI
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: undefined
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: null
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                simple: "hello there" as any
            })
        ).toBe( false );

    })

    it( "tag objects are true if correct value", () => {

        expect(
            isRawCborObj({
                tag: 2,
                data: { uint: BigInt( 2 ) }
            })
        ).toBe( true );

        expect(
            isRawCborObj({
                tag: 2,
            } as any)
        ).toBe( false );
        
        expect(
            isRawCborObj({
                data: { uint: BigInt( 2 ) },
            } as any)
        ).toBe( false );
        
    })

})