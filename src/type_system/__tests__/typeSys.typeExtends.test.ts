import { PValue, pList, PScriptPurpose } from "../../pluts";
import { typeExtends } from "../typeExtends";
import { alias, asData, bs, data, delayed, int, lam, list, map, pair, sop, str, struct, tyVar, unit } from "../types";
import { withAllPairElemsAsData } from "../withAllPairElemsAsData";

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

    test("SoP", () => {

        expect(
            typeExtends(
                sop({ H: { h: int } }),
                sop({ H: { h: int } })
            )
        ).toBe( true )

        expect(
            typeExtends(
                sop({ H: { h: bs } }),
                sop({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                sop({ H: { f: int } }),
                sop({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                sop({ F: { h: int } }),
                sop({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            typeExtends(
                data,
                sop({ H: { h: int } })
            )
        ).toBe( false )

        expect(
            () => typeExtends(
                asData(
                    sop({ H: { h: int } })
                ),
                sop({ H: { h: int } })
            )
        ).toThrow()

        expect(
            () => typeExtends(
                asData(
                    sop({ F: { h: int } })
                ),
                sop({ H: { h: int } })
            )
        ).toThrow()

        expect(
            typeExtends(
                sop({ H: { h: int } }),
                data
            )
        ).toBe( false )

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
            ).toBe( true )

        });

        test("list of alias", () => {

            expect(
                typeExtends(
                    list( alias( bs ) ),
                    tyVar()
                )
            ).toBe( true )

            expect(
                typeExtends(
                    list( alias( bs ) ),
                    list( tyVar() )
                )
            ).toBe( true )

            expect(
                typeExtends(
                    list( alias( bs ) ),
                    list( bs )
                )
            ).toBe( true )

            expect(
                typeExtends(
                    list( alias( bs ) ),
                    map( tyVar(), tyVar() )
                )
            ).toBe( false )

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
            ).toBe( false );

        });

    });

    describe("asData", () => {

        test("asData( int ) doesn't  extends int", () => {
            expect(
                typeExtends(
                    asData( int ),
                    int
                )
            ).toBe( false )
        });

        test("asData( list( int ) ) doesn't extends list( int )", () => {
            expect(
                typeExtends(
                    asData( list( int ) ),
                    list( int )
                )
            ).toBe( false )
        });

        test("list( asData( int ) ) doesn't extends list( int )", () => {
            expect(
                typeExtends(
                    list( asData( int ) ),
                    list( int )
                )
            ).toBe( false )
        });

        test("asData( pair( int, bs ) ) doesn't extends pair( int, bs )", () => {
            expect(
                typeExtends(
                    asData( pair( int, bs ) ),
                    pair( int, bs )
                )
            ).toBe( false )
        });

    });

    describe("pair( asData( a ), asData( b ) )", () => {

        test("int,bs", () => {
            expect(
                typeExtends(
                    pair( asData( int ), asData( bs ) ),
                    pair( int, bs )
                )
            ).toBe( true );
        })

        test("PValue", () => {
            expect(
                typeExtends(
                    withAllPairElemsAsData(
                        PValue.type
                    ),
                    PValue.type
                )
            ).toBe( true );
        });

    })

    test("list(pair( dataLike, dataLike )", () => {

        expect(
            typeExtends(
                pList( pair( PScriptPurpose.type, data ) )([]).type,
                list( pair( data, data ) )
            )
        ).toBe( true )
        
    });

    describe("delayed", () => {

        test("PValue", () => {
            expect(
                typeExtends(
                    delayed(
                        withAllPairElemsAsData(
                            PValue.type
                        )
                    ),
                    delayed(
                        PValue.type
                    )
                )
            ).toBe( true );
        })

    })

})