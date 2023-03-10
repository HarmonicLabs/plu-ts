import { ConstType, constT, ConstTyTag, isWellFormedConstType } from "..";
import { makeRandomWellFormed } from "../test_utils";


describe("isWellFormedConstType", () => {

    it("succeeds on well formed types", () => {

        const wfTypes = [
            [ ConstTyTag.int ],
            [ ConstTyTag.byteStr ],
            [ ConstTyTag.str ],
            [ ConstTyTag.bool ],
            [ ConstTyTag.unit ],
            [ ConstTyTag.data ],

            [ ConstTyTag.list, ConstTyTag.int ],
            [ ConstTyTag.list, ConstTyTag.byteStr ],
            [ ConstTyTag.list, ConstTyTag.str ],
            [ ConstTyTag.list, ConstTyTag.bool ],
            [ ConstTyTag.list, ConstTyTag.unit ],
            [ ConstTyTag.list, ConstTyTag.data ],

            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.int ],        // int[][]
            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.byteStr ],    // bs[][]
            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.str ],        // str[][]
            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.bool ],       // bool[][]

            [ ConstTyTag.pair, ConstTyTag.int, ConstTyTag.int ],
            [ ConstTyTag.pair, ConstTyTag.byteStr, ConstTyTag.byteStr ],
            [ ConstTyTag.pair, ConstTyTag.str, ConstTyTag.str ],
            [ ConstTyTag.pair, ConstTyTag.bool, ConstTyTag.bool ],
            [ ConstTyTag.pair, ConstTyTag.unit, ConstTyTag.unit ],
            [ ConstTyTag.pair, ConstTyTag.data, ConstTyTag.data ],

            [ ConstTyTag.pair, ConstTyTag.int, ConstTyTag.byteStr ],
            [ ConstTyTag.pair, ConstTyTag.byteStr, ConstTyTag.int ],
            [ ConstTyTag.pair, ConstTyTag.bool, ConstTyTag.unit ],
            [ ConstTyTag.pair, ConstTyTag.unit, ConstTyTag.bool ],

            // ( int, int )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.int, 
                        ConstTyTag.int
            ],
            // ( int, bool )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.int, 
                        ConstTyTag.bool
            ],

            // ( int[], int )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int, 
                        ConstTyTag.int
            ],
            
            // ( int[], int[] )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int, 
                        ConstTyTag.list, ConstTyTag.int
            ],

            // ( (int, int) , int[] )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.pair, 
                            ConstTyTag.int,
                            ConstTyTag.int,
                        ConstTyTag.list, ConstTyTag.int
            ]
        ];

        for( const wellFormedType of wfTypes )
        {
            // Debug.log( constTypeToStirng( wellFormedType ) );
            expect(
                isWellFormedConstType( wellFormedType )
            ).toBe( true );
        }
    });

    it("types from the 'constT' object are always well formed", () => {

        const wfTypes = [
            constT.int,
            constT.bool,
            constT.unit,
            constT.str,
            constT.data,

            constT.listOf( constT.int ),
            constT.listOf( constT.bool ),
            constT.listOf( constT.byteStr ),
            constT.listOf( constT.str ),
            constT.listOf( constT.data ),

            constT.pairOf( constT.int , constT.int ),

            constT.pairOf( 
                constT.int , 
                constT.listOf( constT.int ) 
            ),

            constT.listOf(
                constT.pairOf(
                    constT.int,
                    constT.int
                )
            )

        ];

        for( const wellFormedType of wfTypes )
        {
            // Debug.log( constTypeToStirng( wellFormedType ) );
            expect(
                isWellFormedConstType( wellFormedType )
            ).toBe( true );
        }
    });

    it.concurrent("types from the 'constT' object are always well formed, random", () => {

        let wellFormedType: ConstType;

        for( let i = 0; i < 10_000; i++ )
        {
            const wellFormedType = makeRandomWellFormed();

            // Debug.log( wellFormedType );
            
            expect(
                isWellFormedConstType( wellFormedType )
            ).toBe( true );
        }
    });

    it("fails on empty lists", () => {

        expect(
            isWellFormedConstType( [] )
        ).toBe( false );

    })



    it("fails on missing arguments", () => {

        const missingArg = [
            [ ConstTyTag.list ],

            [ ConstTyTag.list, ConstTyTag.list ],

            // ( int, ? )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.int 
            ],

            // ( int[], ? )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int
            ],
            
            // ( int[][], ? )[]
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, 
                        ConstTyTag.list, ConstTyTag.int
            ],

        ];

        for( const miss of missingArg )
        {
            expect(
                isWellFormedConstType( miss )
            ).toBe( false );
        }
    });

    it("fails on to many arguments", () => {

        const tooMuch = [
            [ ConstTyTag.list, ConstTyTag.int, ConstTyTag.int ],
            [ ConstTyTag.list, ConstTyTag.int, ConstTyTag.list ],
            [ ConstTyTag.list, ConstTyTag.str, ConstTyTag.pair ],

            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.int, ConstTyTag.int ],
            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.int, ConstTyTag.list ],
            [ ConstTyTag.list, ConstTyTag.list, ConstTyTag.int, ConstTyTag.pair ],

            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.int, 
                        ConstTyTag.int,

                ConstTyTag.int
            ],

            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int, ConstTyTag.int,
                        ConstTyTag.int
            ],
            
            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int, 
                        ConstTyTag.list, ConstTyTag.int, ConstTyTag.int
            ],

            [ 
                ConstTyTag.list, 
                    ConstTyTag.pair, 
                        ConstTyTag.list, ConstTyTag.int, 
                        ConstTyTag.list, ConstTyTag.int,
                    ConstTyTag.pair,
            ],

        ];

        for( const aLotOfArgs of tooMuch )
        {
            expect(
                isWellFormedConstType( aLotOfArgs )
            ).toBe( false );
        }
    });

    // in theory the function may throw
    // using randomly generated lists of potential types
    // the function should return true or false and not throw
    //
    // PS. the problem is of course non decideable since it would require to test it over all possible inputs
    // the more the test is runt the more confident we can be of the 'never' statement
    it.concurrent("never throws", () => {

        let randTy: ConstTyTag[] ;

        for( let i = 0; i < 10_000; i++ )
        {
            randTy = [ ...new Array( Math.round( Math.random() * 100 ) ).map( _ => {

                    let someTy = 7;
                    while( someTy === 7)
                    {
                        someTy = Math.round( Math.random() * 8 );
                    };

                    return someTy;
                })
            ];

            expect(
                () => isWellFormedConstType( randTy )
            ).not.toThrow();
        }

    });

})