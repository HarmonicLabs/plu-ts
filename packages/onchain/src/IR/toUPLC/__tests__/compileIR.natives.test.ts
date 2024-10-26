import { Application, Lambda, UPLCVar, showUPLC } from "@harmoniclabs/uplc";
import { IRNative } from "../../IRNodes/IRNative";
import { compileIRToUPLC } from "../compileIRToUPLC";


describe("compileIRToUPLC", () => {

    describe("natives", () => {
    
        test("z_comb", () => {
    
            const z = IRNative.z_comb;
    
            const ir_zUPLC = compileIRToUPLC( z );
    
            const innerZ = new Lambda( // toMakeRecursive
                new Application(
                    new UPLCVar( 1 ), // Z
                    new Lambda( // value
                        new Application(
                            new Application(
                                new UPLCVar( 1 ), // toMakeRecursive
                                new UPLCVar( 1 )  // toMakeRecursive
                            ),
                            new UPLCVar( 0 ) // value
                        )
                    )
                )
            );
    
            const ZUPLC = new Lambda( // Z
                new Application(
                    innerZ,
                    innerZ.clone()
                )
            )
    
            // // console.log( showUPLC( ir_zUPLC ) )
            // // console.log( showUPLC( ZUPLC ) )
    
            expect(
                ir_zUPLC
            ).toEqual(
                ZUPLC
            )
    
        });
    
        test("_matchList", () => {
    
            const uplc = compileIRToUPLC( IRNative._matchList );
    
            const expectedUplcStr =
                "[(lam a [(lam b [(lam c (lam d (lam e (lam f (force [[[c f] d] (delay [[e [b f]] [a f]])]))))) (force (force (builtin chooseList)))]) (force (builtin headList))]) (force (builtin tailList))]";
                // "(lam a (lam b (lam c (force [[[(force (force (builtin chooseList))) c] a] (delay [[b [(force (builtin headList)) c]] [(force (builtin tailList)) c]])]))))";
    
            expect(
                showUPLC( uplc )
            ).toEqual(
                expectedUplcStr
            )
    
        });
    
        test("_recursiveList (requireing other negative natives)", () => {
    
            const uplc = compileIRToUPLC( IRNative._recursiveList );

            // console.log( showUPLC( uplc ) );
            
            expect( showUPLC( uplc ) )
            .toEqual(
                "[(lam a [(lam b [a (lam c [[b b] c])]) (lam b [a (lam c [[b b] c])])]) (lam a (lam b (lam c (lam d [(lam e [[[(lam f (lam g (lam h (force [[[(force (force (builtin chooseList))) h] f] (delay [[g [(force (builtin headList)) h]] [(force (builtin tailList)) h]])])))) [b e]] [c e]] d]) [[a b] c]]))))]"
            )
            
        })
    })

});