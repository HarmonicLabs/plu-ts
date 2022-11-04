import pstruct, { pgenericStruct } from ".."
import ByteString from "../../../../../types/HexString/ByteString";
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { padd, pconsBs, pindexBs } from "../../../stdlib/Builtins";
import { perror } from "../../../Syntax";
import Term from "../../../Term";
import { bs, int, unit } from "../../../Term/Type";
import { pByteString } from "../../PByteString";
import { pInt } from "../../PInt";
import { pmakeUnit } from "../../PUnit";
import pmatch from "../pmatch";

const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
});
const SingleCtor = pstruct({
    Ctor : {
        num: int,
        name: bs,
        aUnitCauseWhyNot: unit
    }
})



describe("pmatch", () => {

    test("pmatch( <single constructor> )", () => {

        expect(
            evalScript(
                pmatch( SingleCtor.Ctor({
                    num: pInt( 42 ),
                    name: pByteString( ByteString.fromAscii("Cardano NFTs lmaooooo") ),
                    aUnitCauseWhyNot: pmakeUnit()
                }))
                .onCtor( rawFields => rawFields.extract("num").in( ({ num }) => num ) ) 
            )
        ).toEqual(
            UPLCConst.int( 42 )
        );

    })

    test("two ctors", () => {

        expect(
            evalScript(
                pmatch( PMaybe( int ).Just({ value: pInt(2) }) )
                .onJust( f => f.extract("value").in( v => v.value ) )
                .onNothing( _ => pInt( 0 ) )
            )
        ).toEqual(
            UPLCConst.int( 2 )
        );

    });

    test("pmatch( PMaybe(int).Nothing({}) )", () => {

        const matchNothing = pmatch( PMaybe(int).Nothing({}) );
        
        //*
        expect(
            matchNothing
        ).toEqual({
            onJust: matchNothing.onJust,
            onNothing: matchNothing.onNothing
        })
    
        const matchNothingOnJust = matchNothing.onJust( rawFields => pInt( 0 ) );

        expect(
            matchNothingOnJust
        ).toEqual({
            onNothing: matchNothingOnJust.onNothing
        })
        
        const matchNothingOnNothing = matchNothing.onNothing( rawFields => pInt( 0 ) );
        expect(
            matchNothingOnNothing
        ).toEqual({
            onJust: matchNothingOnNothing.onJust
        })
        //*/
        
        expect(
            evalScript(
                matchNothing
                .onNothing( rawFields => pInt( 1 ) )
                .onJust( rawFields => pInt( 0 ) )
                .toUPLC(0)
            )
        ).toEqual( pInt(1).toUPLC(0) )

    });

    describe("fields extraction", () => {

        test("pmatch with extraction", () => {
    
            expect(
                evalScript(
                    pmatch( PMaybe(int).Just({ value: pInt(42) }) )
                    .onJust( rawFields =>
                        rawFields.extract("value")
                        .in( fields => 
                            fields.value
                        )
                    )
                    .onNothing( _ => pInt( 0 ) )
                )
            ).toEqual(
                UPLCConst.int( 42 )
            );
    
            expect(
                evalScript(
                    pmatch( PMaybe(int).Nothing({}) )
                    .onJust( rawFields =>
                        rawFields.extract("value")
                        .in( fields => 
                            fields.value
                        )
                    )
                    .onNothing( _ => pInt( 0 ) )
                )
            ).toEqual(
                UPLCConst.int( 0 )
            );
    
        });

        const Nums = pstruct({
            TwoNums: {
                a: int,
                b: int
            },
            ThreeNums: {
                c: int,
                d: int,
                e: int
            }
        });

        test("pmatch; extract multiple fields", () => {

            expect(
                evalScript(
                    pmatch( Nums.TwoNums({ a: pInt(2), b: pInt(3) }) )
                    .onTwoNums( nums_ =>  nums_.extract("a", "b").in( ({ a, b }) =>
                        padd.$( a ).$(
                            padd.$( a ).$( b )
                        )
                    ))
                    .onThreeNums( nums_ => nums_.extract("c","d","e").in( nums => 
                        padd.$( nums.c ).$(
                            padd.$( nums.d ).$( nums.e )
                        )
                    ))
                )
            ).toEqual(
                UPLCConst.int( 2 + 2 + 3 )
            );

        });

        test("pmatch: extract multiples Struct firelds", () => {
            const BSs = pstruct({
                TwoBS: {
                    a: bs,
                    b: bs
                },
                ThreeNums: {
                    c: bs,
                    d: bs,
                    e: bs
                }
            })

            const NumOrBs = pstruct({
                NumsOnly: { nums: Nums.type },
                BSsOnly: { bss: BSs.type },
                Both: { nums: Nums.type, bss: BSs.type}
            });

            const nums = Nums.TwoNums({
                a: pInt( 1 ),
                b: pInt( 2 )
            });
            const bss= BSs.TwoBS({
                a: pByteString( ByteString.fromAscii("a") ),
                b: pByteString( ByteString.fromAscii("b") )
            });

            const makeMatch = ( continuation: ( fields: { nums: Term<typeof Nums>, bss: Term<typeof BSs> } ) => Term<any> ) => pmatch( NumOrBs.Both({
                nums,
                bss
            }))
            .onBoth( rawFields => rawFields.extract("nums", "bss").in( continuation ))
            .onBSsOnly( _ => perror( bs ) )
            .onNumsOnly( _ => perror( bs ) )

            expect(
                evalScript(
                    makeMatch( both => both.bss )
                )
            )
            .toEqual(
                evalScript(
                    bss
                )
            );

            expect(
                evalScript(
                    makeMatch( both => both.nums )
                )
            )
            .toEqual(
                evalScript(
                    nums
                )
            );

            expect(
                evalScript(
                    makeMatch( both =>
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            bss.a
                        ))
                        .onThreeNums( _ => perror( bs ) )
                    )
                )
            )
            .toEqual(
                evalScript(
                    pByteString( ByteString.fromAscii("a") )
                )
            );
            
            expect(
                evalScript(
                    makeMatch( both =>
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            bss.b
                        ))
                        .onThreeNums( _ => perror( bs ) )
                    )
                )
            )
            .toEqual(
                evalScript(
                    pByteString( ByteString.fromAscii("b") )
                )
            );
            

            expect(
                evalScript(
                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                nums.a
                            ))
                            .onThreeNums( _ => perror( int ) )

                        ))
                        .onThreeNums( _ => perror( int ) )
                    )
                )
            ).toEqual(
                evalScript(
                    pInt( 1 )
                )
            )

            expect(
                evalScript(
                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                nums.b
                            ))
                            .onThreeNums( _ => perror( int ) )

                        ))
                        .onThreeNums( _ => perror( int ) )
                    )
                )
            ).toEqual(
                evalScript(
                    pInt( 2 )
                )
            )

            expect(
                evalScript(
                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                pconsBs.$( nums.a ).$( bss.a )
                            ))
                            .onThreeNums( _ => perror( bs ) )

                        ))
                        .onThreeNums( _ => perror( bs ) )
                    )
                )
            ).toEqual(
                evalScript(
                    pByteString( Buffer.from("0161","hex") )
                )
            )

            expect(
                evalScript(
                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                pconsBs
                                .$( nums.a )
                                .$(
                                    pconsBs
                                    .$( 
                                        pindexBs
                                        .$( bss.a ).$( pInt( 0 ) )
                                    )
                                    .$(
                                        pconsBs
                                        .$( 
                                            nums.b
                                        )
                                        .$( bss.b )
                                    )
                                )
                            ))
                            .onThreeNums( _ => perror( bs ) )

                        ))
                        .onThreeNums( _ => perror( bs ) )
                    )
                )
            ).toEqual(
                evalScript(
                    pByteString( Buffer.from("01610262","hex") )
                )
            )

        })

    });

    describe("'_' whildcard", () => {

        const OneCtor = pstruct({
            Ctor : {}
        })
        
        const TwoCtors = pstruct({
            Fst: {},
            Snd: {}
        });
        
        const FourCtors = pstruct({
            A: {}, B: {}, C: {}, D: {}
        })

        test.only("pmatch( stuff )._( _ => result) === result", () => {

            expect(
                evalScript(
                    pmatch( OneCtor.Ctor({}) )
                    ._( _ => pInt(1) )
                )
            ).toEqual(
                evalScript(
                    pmatch( OneCtor.Ctor({}) )
                    .onCtor( _ => pInt(1) )
                )
            );

            // ---------------------------------- TwoCtors ---------------------------------- //

            expect(
                evalScript(
                    pmatch( TwoCtors.Fst({}) )
                    .onFst( _ => pInt( 1 ) )
                    .onSnd( _ => pInt( 2 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( TwoCtors.Fst({}) )
                    .onFst( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( TwoCtors.Snd({}) )
                    .onFst( _ => pInt( 1 ) )
                    .onSnd( _ => pInt( 2 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(2)
                )
            );

            expect(
                evalScript(
                    pmatch( TwoCtors.Snd({}) )
                    .onSnd( _ => pInt( 2 ) )
                    ._( _ => pInt( 1 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(2)
                )
            );

            expect(
                evalScript(
                    pmatch( TwoCtors.Snd({}) )
                    .onFst( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(2)
                )
            );

            // ---------------------------------- FourCtors ---------------------------------- //

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    .onC( _ => pInt( 3 ) )
                    .onD( _ => pInt( 4 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    .onC( _ => pInt( 3 ) )
                    ._( _ => pInt( 4 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(1)
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt(0)
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.A({}) )
                    .onB( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt( 0 )
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.B({}) )
                    .onB( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt( 1 )
                )
            );

            expect(
                evalScript(
                    pmatch( FourCtors.B({}) )
                    .onA( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                evalScript(
                    pInt( 0 )
                )
            );
        })
    })

})