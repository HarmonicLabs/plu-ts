import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";
import { UPLCTerm, ErrorUPLC, showUPLC, prettyUPLC, compileUPLC, UPLCProgram } from "@harmoniclabs/uplc";
import { Term, pmatch, termTypeToString, typeExtends } from "../../../..";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { PMaybe, fromData, pBool, pByteString, pInt, pPair, pdelay, pfn, phoist, pif, plam, precursiveList, ptoData, toData } from "../../../../lib";
import { pList } from "../../../../lib/std/list/const";
import { bool, bs, fn, int, list } from "../../../../../type_system/types";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";
import { PAssetsEntry, PValue, PValueEntry } from "../PValue";
import { getFstT, getSndT } from "../../../../../type_system/tyArgs";
import { debugOptions, productionOptions } from "../../../../../IR/toUPLC/CompilerOptions";
import { writeFileSync } from "fs";

const currSym = PCurrencySymbol.from( pByteString("ff".repeat(28)) );
const tn = PTokenName.from( pByteString("") );

const oneEntryValue = PValue.from( 
    pList( PValueEntry.type )([
        PValueEntry.from(
            pPair( PValueEntry.type[1][1], PValueEntry.type[1][2] )
            (
                currSym,
                pList( PAssetsEntry.type )([
                    PAssetsEntry.from(
                        pPair( getFstT( PAssetsEntry.type[1] ), getSndT( PAssetsEntry.type[1] ) )(
                            tn,
                            pInt(1_000_000)
                        )
                    )
                ])
            )
        )
    ])
);

const dynamicOneEntryValue = fromData( PValue.type )(
    toData( PValue.type )(
        oneEntryValue
    )
) as any

describe("Machine.evalSimple( PValue )", () => {

    test("empty value constructed correctly", () => {
        expect(
            Machine.evalSimple(
                PValue.from( pList( PValueEntry.type )([]) as any )
            ) instanceof CEKConst
        ).toBe( true )
        
    });

    test("one entry value", () => {
        expect(
            Machine.evalSimple( oneEntryValue ) instanceof CEKConst
        ).toBe( true )
    });

    test("ptoData( PValue.type )", () => {

        const term = ptoData( PValue.type );
        const ir = term.toIR();
        const uplc = compileIRToUPLC( ir );

    })
    
    test("one entry to data", () => {

        const term = toData( PValue.type )( oneEntryValue );
        const ir = term.toIR();
        const uplc = compileIRToUPLC( ir );

        const { result } = Machine.eval( uplc );

        expect(
            result instanceof CEKConst
        ).toBe( true )

    });

    test("value in maybe", () => {

        const { result, logs } = Machine.eval(
            PMaybe( PValue.type ).Just({ val: toData( PValue.type )( oneEntryValue ) })
        );
        
        expect(
            result instanceof CEKConst
        ).toBe( true )

    })

});

const pvalueOf = phoist(
    pfn([
        PValue.type,
        bs,
        bs
    ],  int)
    (( value, currSym, tokenName ) => {

        return pmatch(
            value.find( entry => 
                entry.fst.eq( currSym )
            )
        )
        .onJust( just => {

            const policyEntry = just.val;

            return pmatch(
                    policyEntry.snd.find( assetEntry => 
                        {
                            return assetEntry.fst.eq( tokenName )
                        }
                    )
                )
                .onJust( just => just.val.snd )
                .onNothing( _ => pInt( 0 ) );
        })
        .onNothing( _ => pInt( 0 ) );       
    })
);

const pvalueOfBetter = phoist(
    pfn([
        PValue.type,
        PCurrencySymbol.type,
        PTokenName.type
    ],  int)
    (( value, currSym, tokenName ) =>
        precursiveList( int, PValueEntry.type )
        .$( _self => pdelay( pInt(0) ) )
        .$( 
            pfn([
                fn([ list(PValueEntry.type) ], int ),
                PValueEntry.type,
                list( PValueEntry.type )
            ],  int)
            ((self, head, tail ) => {

                return pif( int ).$( head.fst.eq( currSym ) )
                .then(
    
                    precursiveList( int, PAssetsEntry.type )
                    .$( _self => pdelay( pInt(0) ) )
                    .$(
                        pfn([
                            fn([ list(PAssetsEntry.type) ], int ),
                            PAssetsEntry.type,
                            list( PAssetsEntry.type )
                        ],  int)
                        (
                            (self, head, tail) =>
                            pif( int ).$( head.fst.eq( tokenName ) )
                            .then( head.snd )
                            .else( self.$( tail ) )
                        )
                    )
                    .$( head.snd )
                )
                .else( self.$( tail ) )
            }
            )
        )
        .$( value )
    )
);

describe("pvalueOf", () => {

    test("non exsistent coin", () => {

        const expected = Machine.evalSimple( pInt(0) );
        const { result: received, budgetSpent: exBudget } = Machine.eval( pvalueOf.$( oneEntryValue ).$("").$("") );
        // const _expected = Machine.evalSimple( pInt(0) );
        // const { result: _received, budgetSpent } = Machine.eval( pvalueOfBetter.$( oneEntryValue ).$("" as any).$("" as any) );

        expect(
            received
        ).toEqual(
            expected
        );

        // expect(
        //     _received
        // ).toEqual(
        //     _expected
        // );

    });

    /**
     * example of bad UPLC
     */
    test("policy present but not token", () => {

        oneEntryValue.amountOf( currSym, tn );

        oneEntryValue.pamountOf.$( currSym ).$( tn )

        const expected = Machine.evalSimple( pInt(0) );

        const uplc = pvalueOf.$( oneEntryValue ).$( currSym as any ).$("abc").toUPLC( 0 );

        let received !: UPLCTerm;
        expect(
            () => received = Machine.evalSimple( uplc )
        ).not.toThrow()
        //*
        expect(
            received
        ).toEqual(
            expected
        );
        //*/

    });

    test("token present", () => {

        const term = pvalueOf.$( oneEntryValue ).$( currSym as any ).$( tn as any );

        const uplc = term.toUPLC(0);

        const expected = Machine.evalSimple( pInt( 1_000_000 ) );
        const received = Machine.evalSimple( uplc );
        
        /*
        const compiled = UPLCEncoder.compile( new UPLCProgram([1,0,0], uplc.clone() ) ).toBuffer().buffer;

        console.log( showUPLC( uplc ) );
        // console.log( compiled.toString("hex") );
        // console.log( compiled.length );
        console.log( received );
        //*/
        
        expect(
            received
        ).toEqual(
            expected
        );

        expect(
            term.type
        )
        .toEqual( int )

        expect(
            Machine.evalSimple(
                pInt(1_000_000).eq( term as any )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

    });

    describe("with dynamic value", () => {

        test("something simple", () => {

            expect(
                Machine.evalSimple(
                    dynamicOneEntryValue.head.fst.eq("")
                ) instanceof ErrorUPLC
            ).toBe(
                false
            );

        });

        test("something simple but in function", () => {

            const somethingSimple = plam( PValue.type, bool )
            ( mySuperDuperValue => mySuperDuperValue.head.fst.eq("") );

            const res = Machine.evalSimple(
                somethingSimple.$( dynamicOneEntryValue )
            );

            // console.log( res );

            expect(
                res instanceof ErrorUPLC
            ).toBe(
                false
            );

        })

        test.only("token present", () => {

            const term = pvalueOf.$( dynamicOneEntryValue ).$( currSym as any ).$( tn as any );

            const uplc = term.toUPLC(0, debugOptions);

            const expected = Machine.evalSimple( pInt( 1_000_000 ) );
            const received = Machine.evalSimple( uplc );
            
            // console.log( showUPLC( uplc ) );
            /*
            const compiled = UPLCEncoder.compile( new UPLCProgram([1,0,0], uplc.clone() ) ).toBuffer().buffer;

            console.log( showUPLC( uplc ) );
            // console.log( compiled.toString("hex") );
            // console.log( compiled.length );
            console.log( received );
            //*/
            
            expect(
                received
            ).toEqual(
                expected
            );

            expect(
                term.type
            )
            .toEqual( int )

            const termUplc = pInt(1_000_000).eq( term ).toUPLC(0, productionOptions);
            
            // writeFileSync(
            //     "./some.flat",
            //     compileUPLC(
            //         new UPLCProgram( [1,1,0], termUplc )
            //     ).toBuffer().buffer
            // )

            // console.log( showUPLC( termUplc ) );

            expect(
                Machine.evalSimple(
                    termUplc // pInt(1_000_000).eq( term )
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            );

        });

        /**
         * this will be a interesting one to solve
         */
        test("token present (pvalueOfBetter)", () => {

            const term = pvalueOfBetter.$( dynamicOneEntryValue ).$( currSym as any ).$( tn as any );

            const uplc = term.toUPLC(0);

            const expected = Machine.evalSimple( pInt( 1_000_000 ) );
            const received = Machine.evalSimple( uplc );
            
            /*
            // const compiled = UPLCEncoder.compile( new UPLCProgram([1,0,0], uplc.clone() ) ).toBuffer().buffer;

            console.log( showUPLC( uplc ) );
            // console.log( compiled.toString("hex") );
            // console.log( compiled.length );
            console.log( received );
            //*/
            
            expect(
                received
            ).toEqual(
                expected
            );

            expect(
                term.type
            )
            .toEqual( int )

            expect(
                Machine.evalSimple(
                    pInt(1_000_000).eq( term as any )
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            );

        })
    })
})