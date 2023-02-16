import { typeExtends } from "../typeExtends";
import { alias, asData, bs, data, int, lam, list, pair, str, struct, tyVar, unit } from "../types";

describe("typeExtends", () => {

    test("int", () => {

        expect( typeExtends( int, int ) ).toBe( true );

        expect( typeExtends( bs, int ) ).toBe( false );
        expect( typeExtends( str, int ) ).toBe( false );
        expect( typeExtends( unit, int ) ).toBe( false );
        expect( typeExtends( data, int ) ).toBe( false );
        expect( typeExtends( pair( int, int ), int ) ).toBe( false );
        expect( typeExtends( lam( int, int ), int ) ).toBe( false );
        expect( typeExtends( struct({ H: { h: int } }), int ) ).toBe( false );

    });

    test("data", () => {

        expect( typeExtends( data, data ) ).toBe( true );
        expect( typeExtends( asData( bs ), data ) ).toBe( true );
        expect( typeExtends( asData( int ), data ) ).toBe( true );
        expect( typeExtends( struct({ H: { h: int } }), data ) ).toBe( true );
        expect( typeExtends( asData( pair( int, int ) ), data ) ).toBe( true );

        expect(
            typeExtends( 
                pair( 
                    data,
                    data
                ),
                data
            )
        ).toBe( false );
        expect(
            typeExtends( 
                pair( 
                    asData( int ),
                    asData( int )
                ),
                data
            )
        ).toBe( false );

    });

    test("struct", () => {

        expect(
            typeExtends(
                struct({ H: { h: int } }),
                struct({ H: { h: int } })
            )
        ).toBe( true )

        expect(
            typeExtends(
                struct({ H: { h: bs } }),
                struct({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                struct({ H: { f: int } }),
                struct({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                struct({ F: { h: int } }),
                struct({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                data,
                struct({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                asData(
                    struct({ H: { h: int } })
                ),
                struct({ H: { h: int } })
            )
        ).toBe( true )

        expect(
            typeExtends(
                asData(
                    struct({ F: { h: int } })
                ),
                struct({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                struct({ H: { h: int } }),
                data
            )
        ).toBe( true )

    });

    describe("extends generic", () => {

        test("int extends any", () => {
            expect(
                typeExtends(
                    int,
                    tyVar()
                )
            ).toBe( true )
        });

        test("list extends any", () => {

            expect(
                typeExtends(
                    list( int ),
                    tyVar()
                )
            ).toBe( true )

            expect(
                typeExtends(
                    list( int ),
                    list( tyVar() )
                )
            )

        });

        test("pair extends any", () => {

            expect(
                typeExtends(
                    pair( int, bs ),
                    tyVar()
                )
            ).toBe( true )

            expect(
                typeExtends(
                    pair( int, bs ),
                    pair( tyVar(), bs )
                )
            ).toBe( true );

            expect(
                typeExtends(
                    pair( int, bs ),
                    pair( int, tyVar() )
                )
            ).toBe( true );

            expect(
                typeExtends(
                    pair( int, bs ),
                    pair( tyVar(), int )
                )
            ).toBe( false );

            expect(
                typeExtends(
                    pair( int, bs ),
                    pair( tyVar(), tyVar() )
                )
            ).toBe( true );

            expect(
                typeExtends(
                    alias( pair( int, bs ) ),
                    pair( tyVar(), tyVar() )
                )
            ).toBe( true )
            
            expect(
                typeExtends(
                    asData( pair( int, bs ) ),
                    pair( tyVar(), tyVar() )
                )
            ).toBe( true );

        });

    });

    describe("asData", () => {

        test("asData( int ) extends int", () => {
            expect(
                typeExtends(
                    asData( int ),
                    int
                )
            ).toBe( true )
        });

        test("asData( list( int ) ) extends list( int )", () => {
            expect(
                typeExtends(
                    asData( list( int ) ),
                    list( int )
                )
            ).toBe( true )
        });

        test("list( asData( int ) ) extends list( int )", () => {
            expect(
                typeExtends(
                    list( asData( int ) ),
                    list( int )
                )
            ).toBe( true )
        });

        test("asData( pair( int, bs ) ) extends pair( int, bs )", () => {
            expect(
                typeExtends(
                    asData( pair( int, bs ) ),
                    pair( int, bs )
                )
            ).toBe( true )
        });

    })

})