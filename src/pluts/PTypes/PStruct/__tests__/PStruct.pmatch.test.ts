import { pstruct } from "../pstruct"
import { Term } from "../../../Term";
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { pInt } from "../../../lib/std/int/pInt";
import { pmakeUnit } from "../../../lib/std/unit/pmakeUnit";
import { pByteString } from "../../../lib/std/bs/pByteString";
import { padd, pconsBs, pindexBs } from "../../../lib/builtins";
import { perror } from "../../../lib/perror";
import { TermType, bs, int, unit } from "../../../../type_system/types";
import { pDataB, pDataI, pmatch, toData } from "../../../lib";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { ByteString } from "@harmoniclabs/bytestring";
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";

const SingleCtor = pstruct({
    Ctor : {
        num: int,
        name: bs,
        aUnitCauseWhyNot: unit
    }
})

const SingleField = pstruct({
    SingleField: { field: int }
})

describe.skip("pmatch", () => {

    test("pmatch( <single field> )", () => {

        const term = SingleField.SingleField({ field: pDataI(42) }).extract("field").in( ({ field }) => field );
        const uplc = term.toUPLC(0);
        const res = Machine.evalSimple( uplc );

        expect(
            res
        ).toEqual(
            Machine.evalSimple(
                pInt(42)
            )
        )
    })

    test("pmatch( <single constructor> )", () => {

        expect(
            Machine.evalSimple(
                pmatch( SingleCtor.Ctor({
                    num: pDataI( 42 ),
                    name: pDataB( ByteString.fromAscii("Cardano NFTs lmaooooo") ),
                    aUnitCauseWhyNot: toData( unit )( pmakeUnit() )
                }))
                .onCtor( rawFields => rawFields.extract("num").in( ({ num }) => num ) ) 
            )
        ).toEqual(
            CEKConst.int( 42 )
        );

    })

    test("two ctors", () => {

        expect(
            Machine.evalSimple(
                pmatch( PMaybe( int ).Just({ val: pDataI(2) }) )
                .onJust( f => f.extract("val").in( v => v.val ) )
                .onNothing( _ => pInt( 0 ) )
            )
        ).toEqual(
            CEKConst.int( 2 )
        );

    });

    test("pmatch( PMaybe(int).Nothing({}) )", () => {

        const matchNothing = pmatch( PMaybe(int).Nothing({}) );
        
        //*
        expect(
            matchNothing
        ).toEqual({
            onJust: matchNothing.onJust,
            onNothing: matchNothing.onNothing,
            _: matchNothing._
        })
    
        const matchNothingOnJust = matchNothing.onJust( rawFields => pInt( 0 ) );

        expect(
            matchNothingOnJust
        ).toEqual({
            onNothing: matchNothingOnJust.onNothing,
            _: matchNothingOnJust._
        })
        
        const matchNothingOnNothing = matchNothing.onNothing( rawFields => pInt( 0 ) );
        expect(
            matchNothingOnNothing
        ).toEqual({
            onJust: matchNothingOnNothing.onJust,
            _: matchNothingOnNothing._
        })
        //*/
        
        expect(
            Machine.evalSimple(
                matchNothing
                .onNothing( rawFields => pInt( 1 ) )
                .onJust( rawFields => pInt( 0 ) )
                .toUPLC(0)
            )
        ).toEqual( Machine.evalSimple( pInt(1) ) )

    });

    describe("fields extraction", () => {

        test("pmatch with extraction", () => {
    
            expect(
                Machine.evalSimple(
                    pmatch( PMaybe(int).Just({ val: pDataI(42) }) )
                    .onJust( rawFields =>
                        rawFields.extract("val")
                        .in( fields => 
                            fields.val
                        )
                    )
                    .onNothing( _ => pInt( 0 ) )
                )
            ).toEqual(
                CEKConst.int( 42 )
            );
    
            expect(
                Machine.evalSimple(
                    pmatch( PMaybe(int).Nothing({}) )
                    .onJust( rawFields =>
                        rawFields.extract("val")
                        .in( fields => 
                            fields.val
                        )
                    )
                    .onNothing( _ => pInt( 0 ) )
                )
            ).toEqual(
                CEKConst.int( 0 )
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

            const term =  pmatch( Nums.TwoNums({ a: pDataI(2), b: pDataI(3) }) )
            .onTwoNums( nums_ =>  nums_.extract("a", "b").in( ({ a, b }) =>
                padd.$( a ).$(
                    padd.$( a ).$( b )
                )
            ))
            .onThreeNums( nums =>
                padd.$( nums.c ).$(
                    padd.$( nums.d ).$( nums.e )
                )
            );

            const uplc = term.toUPLC();

            expect(
                Machine.evalSimple(
                   uplc
                )
            ).toEqual(
                CEKConst.int( 2 + 2 + 3 )
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
                a: pDataI( 1 ),
                b: pDataI( 2 )
            });
            const bss= BSs.TwoBS({
                a: pDataB( ByteString.fromAscii("a") ),
                b: pDataB( ByteString.fromAscii("b") )
            });

            const makeMatch = ( continuation: ( fields: { nums: Term<typeof Nums>, bss: Term<typeof BSs> } ) => Term<any>, outTy: TermType ) => 
            pmatch( NumOrBs.Both({
                nums: toData( Nums.type )( nums ),
                bss: toData( BSs.type )( bss )
            }))
            .onBoth( rawFields => rawFields.extract("nums", "bss").in( continuation as any ))
            .onBSsOnly( _ =>  perror( outTy ) )
            .onNumsOnly( _ => perror( outTy ) )

            expect(
                Machine.evalSimple(
                    makeMatch( both => both.bss, BSs.type )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    bss
                )
            );

            expect(
                Machine.evalSimple(
                    makeMatch( both => both.nums, Nums.type )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    nums
                )
            );

            expect(
                Machine.evalSimple(
                    makeMatch(
                        
                        both =>
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            bss.a
                        ))
                        .onThreeNums( _ => perror( bs ) ),

                        bs
                    )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    pByteString( ByteString.fromAscii("a") )
                )
            );
            
            expect(
                Machine.evalSimple(
                    makeMatch(
                        
                        both =>
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            bss.b
                        ))
                        .onThreeNums( _ => perror( bs ) ),

                        bs
                    )
                )
            )
            .toEqual(
                Machine.evalSimple(
                    pByteString( ByteString.fromAscii("b") )
                )
            );
            

            expect(
                Machine.evalSimple(
                    makeMatch(
                        
                        both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                nums.a
                            ))
                            .onThreeNums( _ => perror( int ) )

                        ))
                        .onThreeNums( _ => perror( int ) ),

                        int
                    )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 1 )
                )
            )

            expect(
                Machine.evalSimple(

                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                nums.b
                            ))
                            .onThreeNums( _ => perror( int ) )

                        ))
                        .onThreeNums( _ => perror( int ) ),

                        int
                    )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 2 )
                )
            )

            expect(
                Machine.evalSimple(

                    makeMatch( both => 
                        pmatch( both.bss )
                        .onTwoBS( rawFields => rawFields.extract("a","b").in(  bss =>
                            
                            pmatch( both.nums )
                            .onTwoNums( rawNums => rawNums.extract("a","b").in( nums =>
                                pconsBs.$( nums.a ).$( bss.a )
                            ))
                            .onThreeNums( _ => perror( bs ) )

                        ))
                        .onThreeNums( _ => perror( bs ) ),

                        bs
                    )
                )
            ).toEqual(
                Machine.evalSimple(
                    pByteString( fromHex("0161") )
                )
            )

            expect(
                Machine.evalSimple(
                    makeMatch(
                        
                        both => 
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
                        .onThreeNums( _ => perror( bs ) ),

                        bs
                    )
                )
            ).toEqual(
                Machine.evalSimple(
                    pByteString( fromHex("01610262") )
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

        test("pmatch( stuff )._( _ => result) === result", () => {

            const uplc = pmatch( OneCtor.Ctor({}) )
                ._( _ => pInt(1) ).toUPLC();

            expect(
                Machine.evalSimple(
                    uplc
                )
            ).toEqual(
                Machine.evalSimple(
                    pmatch( OneCtor.Ctor({}) )
                    .onCtor( _ => pInt(1) )
                )
            );

        })

        test("two ctors", () => {

            const uplc  =pmatch( TwoCtors.Fst({}) )
            .onFst( _ => pInt( 1 ) )
            .onSnd( _ => pInt( 2 ) )
            .toUPLC()

            expect(
                Machine.evalSimple(
                    uplc
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

        })

        test("multi ctors", () => {

            // ---------------------------------- TwoCtors ---------------------------------- //

            

            expect(
                Machine.evalSimple(
                    pmatch( TwoCtors.Fst({}) )
                    .onFst( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( TwoCtors.Snd({}) )
                    .onFst( _ => pInt( 1 ) )
                    .onSnd( _ => pInt( 2 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(2)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( TwoCtors.Snd({}) )
                    .onSnd( _ => pInt( 2 ) )
                    ._( _ => pInt( 1 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(2)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( TwoCtors.Snd({}) )
                    .onFst( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(2)
                )
            );

            // ---------------------------------- FourCtors ---------------------------------- //

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    .onC( _ => pInt( 3 ) )
                    .onD( _ => pInt( 4 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    .onC( _ => pInt( 3 ) )
                    ._( _ => pInt( 4 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    .onB( _ => pInt( 2 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    .onA( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(1)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(0)
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.A({}) )
                    .onB( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 0 )
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.B({}) )
                    .onB( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 1 )
                )
            );

            expect(
                Machine.evalSimple(
                    pmatch( FourCtors.B({}) )
                    .onA( _ => pInt( 1 ) )
                    ._( _ => pInt( 0 ) )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 0 )
                )
            );
        })
    })

})