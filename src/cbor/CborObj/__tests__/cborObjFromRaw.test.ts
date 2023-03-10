import { cborObjFromRaw } from ".."
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";
import { CborArray } from "../CborArray";
import { CborBytes } from "../CborBytes";
import { CborMap } from "../CborMap";
import { CborNegInt } from "../CborNegInt";
import { CborSimple } from "../CborSimple";
import { CborText } from "../CborText";
import { CborUInt } from "../CborUInt";


describe( "cborObjFromRaw", () => {

    it("throws on non valid RawCborObj", () => {

        expect( () => 
            cborObjFromRaw( false as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( 2 as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( [] as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( null as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( undefined as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( {} as any )
        ).toThrow()

        expect( () => 
            cborObjFromRaw( { something: "useless" } as any )
        ).toThrow()

    });

    it("converts uint", () => {

        expect(
            cborObjFromRaw({
                uint: BigInt( 0 )
            })
        ).toEqual(
            new CborUInt( 0 )
        );

        expect(
            cborObjFromRaw({
                uint: BigInt( 2 )
            })
        ).toEqual(
            new CborUInt( 2 )
        );

    })

    it("converts negatives", () => {

        expect(
            cborObjFromRaw({
                neg: BigInt( -1 )
            })
        ).toEqual(
            new CborNegInt( -1 )
        );

        expect(
            cborObjFromRaw({
                neg: BigInt( -2 )
            })
        ).toEqual(
            new CborNegInt( -2 )
        );
        
    })

    it("converts bytes", () => {

        expect(
            cborObjFromRaw({
                bytes: new Uint8Array(0)
            })
        ).toEqual(
            new CborBytes( new Uint8Array(0) )
        );

        expect(
            cborObjFromRaw({
                bytes: fromUtf8( "hello utf8" )
            })
        ).toEqual(
            new CborBytes( fromUtf8( "hello utf8" ) )
        );
        
    })

    it("converts text", () => {

        expect(
            cborObjFromRaw({
                text: ""
            })
        ).toEqual(
            new CborText( "" )
        );

        expect(
            cborObjFromRaw({
                text: "hello there"
            })
        ).toEqual(
            new CborText( "hello there" )
        );
        
    })

    it("converts arrays", () => {

        expect(
            cborObjFromRaw({
                array: []
            })
        ).toEqual(
            new CborArray( [] )
        );

        expect(
            cborObjFromRaw({
                array: "hello there".split('').map( ch => { return { text: ch } })
            })
        ).toEqual(
            new CborArray( "hello there".split('').map( ch => new CborText( ch ) ) )
        );
        
    })

    it("converts maps", () => {

        expect(
            cborObjFromRaw({
                map: []
            })
        ).toEqual(
            new CborMap( [] )
        );

        expect(
            cborObjFromRaw({
                map: [
                    {
                        k: { uint: BigInt( 2 ) },
                        v: { text: "2" }
                    }
                ]
            })
        ).toEqual(
            new CborMap([
                {
                    k: new CborUInt( 2 ),
                    v: new CborText( "2" )
                }
            ])
        );
        
    })

    it("converts simple", () => {

        expect(
            cborObjFromRaw({
                simple: undefined
            })
        ).toEqual(
            new CborSimple( undefined )
        );

        expect(
            cborObjFromRaw({
                simple: null
            })
        ).toEqual(
            new CborSimple( null )
        );
        
        expect(
            cborObjFromRaw({
                simple: true
            })
        ).toEqual(
            new CborSimple( true )
        );
        
        expect(
            cborObjFromRaw({
                simple: false
            })
        ).toEqual(
            new CborSimple( false )
        );
        
        expect(
            cborObjFromRaw({
                simple: 2
            })
        ).toEqual(
            new CborSimple( 2 )
        );

        expect(
            cborObjFromRaw({
                simple: 256
            })
        ).toEqual(
            new CborSimple( 256 )
        );

        expect(
            cborObjFromRaw({
                simple: -2
            })
        ).toEqual(
            new CborSimple( -2 )
        );

        expect(
            cborObjFromRaw({
                simple: 2.4
            })
        ).toEqual(
            new CborSimple( 2.4 )
        );
    })
})