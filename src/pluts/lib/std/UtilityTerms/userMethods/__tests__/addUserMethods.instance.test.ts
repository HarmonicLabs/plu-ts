import { showUPLC } from "@harmoniclabs/uplc";
import { Term, pBool, pInt, padd, palias, perror, pfn, phoist, pmatch, punBData } from "../../../../..";
import { addUserMethods } from "../addUserMethods";
import { int, lam, bs, map, data, bool } from "../../../../../../type_system";


describe("addUserMethod result", () => {

    test("int", () => {

        const baseTerm = pInt(0);

        const methods = {
            addOne : padd.$( 1 ),
            doMultipleStuff: pfn([ int, int ], int)
            (( self, other ) => self.add( other ) )
        };

        const term = addUserMethods( baseTerm, methods );

        const termKeys = Object.keys( term );

        expect( termKeys.includes("addOne") ).toEqual( true );
        expect( termKeys.includes("paddOne") ).toEqual( false );

        expect( term.addOne instanceof Term ).toBe( true )
        expect( term.paddOne ).toBe( undefined )

        expect( termKeys.includes("doMultipleStuff") ).toEqual( true );
        expect( termKeys.includes("pdoMultipleStuff") ).toEqual( true );

        expect( typeof term.doMultipleStuff ).toEqual("function");
        expect( term.pdoMultipleStuff instanceof Term ).toEqual( true );

        expect( term.pdoMultipleStuff.type ).toEqual( lam( int, int ) );
    });

    test("fail non well formed", () => {

        const baseTerm = pInt(0);

        const methods = {
            addOne : padd.$( 1 ),
            paddOne: pfn([ int, int ], int)
            (( self, other ) => self.add( other ) )
        };

        expect(() => {
            addUserMethods( baseTerm, methods );
        }).toThrow();

    });

    describe("cip 68 nft metadata", () => {

        const plookupBsInMetadata = phoist(
            pfn([
                bs,
                map( bs, data )
            ],  bs)
            (( key, metadata ) =>
                pmatch( metadata.lookup( key ) )
                .onJust(({ val }) => punBData.$( val ))
                .onNothing( _ => perror(bs) ) 
            )
        );
        
        const PNftMetadata = palias(
            map( bs, data ),
            self_t => {

                return {
                    name: plookupBsInMetadata.$("name"),
                    image: plookupBsInMetadata.$("image")
                }
            }
        );

        test("has name and image", () => {

            const someTerm = pfn([
                PNftMetadata.type
            ], bool)
            ( metadata => {

                const keys = Object.keys( metadata );

                expect( keys.includes("name") ).toBe( true );
                expect( keys.includes("image") ).toBe( true );
                
                expect( keys.includes("pname") ).toBe( false );
                expect( keys.includes("pimage") ).toBe( false );

                expect( metadata.name.type ).toEqual( bs );
                expect( metadata.image.type ).toEqual( bs );

                return metadata.name.eq("hello");
            });

            const uplc = someTerm.toUPLC();
        })

    });
})