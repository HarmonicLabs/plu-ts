import { Machine } from "../../../../../CEK";
import { pmatch } from "../../../../PTypes/PStruct/pmatch";
import { PValue } from "../../Value/PValue";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { pInt } from "../../../../lib/std/int/pInt";
import { pBool } from "../../../../lib/std/bool/pBool";
import { fromData, perror, pisEmpty } from "../../../../lib";
import { ErrorUPLC } from "../../../../../UPLC/UPLCTerms/ErrorUPLC";
import { int, termTypeToString } from "../../../../type_system";
import { _purp, beef32AsData, ctx, txInfo_v1 } from "../../../../../test_utils"
import { showUPLC } from "../../../../../UPLC/UPLCTerm";

/*
import fs from "node:fs"

import v8Profiler from 'v8-profiler-next';
import { PAsData } from "../../../../PTypes";
v8Profiler.setGenerateType(1);
const title = 'pvalueOf';

v8Profiler.startProfiling(title, true);

afterAll(() => {
    const profile = v8Profiler.stopProfiling(title);
    profile.export(function (error, result: any) {
        // if it doesn't have the extension .cpuprofile then
        // chrome's profiler tool won't like it.
        // examine the profile:
        //   Navigate to chrome://inspect
        //   Click Open dedicated DevTools for Node
        //   Select the profiler tab
        //   Load your file
        fs.writeFileSync(`./${title}.cpuprofile`, result);
        profile.delete();
    });
});
//*/

describe("pmatch( <PScriptContext> )", () => {

    test("extract tx", () => {

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("tx").in( ({tx}) => tx )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                txInfo_v1
            )
        );

    });

    test("extract tx and purpose", () => {

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("tx","purpose").in( ({tx}) => tx )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                txInfo_v1
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","tx").in( ({tx}) => tx )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                txInfo_v1
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("tx","purpose").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _purp
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","tx").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _purp
            )
        );

    });

    describe("extract fee", () => {

        test("inputs extracted", () => {
            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("tx").in( ({ tx }) =>
                    tx.extract("inputs").in( ({ inputs }) => pisEmpty.$( inputs.tail ) )
                    ))
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            )
        });

        test("outputs extracted", () => {

            let term = pmatch( ctx )
            .onPScriptContext( _ => _.extract("tx").in( ({ tx }) =>
            tx.extract("outputs").in( ({ outputs }) => pisEmpty.$( outputs ) )
            ));

            expect(
                Machine.evalSimple(
                    term
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            )

        })

        test("interval lower bound extracted", () => {

            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("tx").in( ({ tx }) =>
                    tx.extract("interval").in( ({ interval }) =>
                    interval.extract("from").in( ({ from }) =>
                    from.extract("bound").in( ({ bound }) => 

                    pmatch( bound )
                    .onPFinite( _ => _.extract("_0").in( ({ _0 }) => _0 ))
                    ._( _ => perror( int ) )
                    )))))
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 1 )
                )
            )

        });
    
        test("extract input value", () => {
            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("tx").in( ({ tx }) =>

                        tx.extract("inputs").in( ({ inputs }) =>

                        inputs.head.extract("resolved").in( ({ resolved: input }) => 

                        input.extract("value").in( ({value}) => value )
                        
                    ))))
                )
            ).toEqual(
                Machine.evalSimple(
                    fromData( PValue.type )( beef32AsData )
                )
            )
        })

        test.only("extract tx only", () => {

            const term = pmatch( ctx )
                .onPScriptContext( _ => _.extract("tx").in( ({ tx }) => tx ));
            const uplc = term.toUPLC(0);
            let result = Machine.evalSimple(
                uplc
            );

            /*
            // console.log( showUPLC( uplc ) );
            // console.log( termTypeToString( term.type ) );
            console.log( result );
            //*/

            expect(
                result instanceof ErrorUPLC
            ).toEqual(
                false
            )

        })
    })

    describe("match Purpose", () => {

        test("all continuations", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onMinting( _ => pInt( 1 ) )
                    .onSpending( _ => pInt( 2 ) )
                    .onRewarding( _ => pInt( 3 ) )
                    .onCertifying( _ => pInt( 4 ) )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            )

        })

        test("only mint ( purpose is Spending )", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onMinting( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            );

        })

        test("only spend ( purpose is Spending )", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onSpending( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                UPLCConst.int( 1 )
            );

        })

    })

})