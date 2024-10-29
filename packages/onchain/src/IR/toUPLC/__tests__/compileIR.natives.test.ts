import { Application, Lambda, UPLCVar, prettyUPLC, showUPLC } from "@harmoniclabs/uplc";
import { IRNative } from "../../IRNodes/IRNative";
import { compileIRToUPLC } from "../compileIRToUPLC";
import { debugOptions } from "../CompilerOptions";


describe("compileIRToUPLC", () => {

    describe("natives", () => {
    
        test("z_comb", () => {
    
            const z = IRNative.z_comb;
    
            const ir_zUPLC = compileIRToUPLC( z, debugOptions );
    
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
    
            // console.log( prettyUPLC( ir_zUPLC ) )
            // console.log( prettyUPLC( ZUPLC ) )
    
            expect(
                showUPLC(
                    ir_zUPLC
                )
            ).toEqual(
                showUPLC(
                    ZUPLC
                )
            )
    
        });
    
        test.skip("_matchList", () => {
    
            const uplc = compileIRToUPLC( IRNative._matchList );
    
            const expectedUplcStr =
                "[(lam a [(lam b [(lam c (lam d (lam e (lam f (force (force [[[c f] d] (delay [[e [b f]] [a f]])])))))) (force (force (builtin chooseList)))]) (force (builtin headList))]) (force (builtin tailList))]";
                // "(lam a (lam b (lam c (force [[[(force (force (builtin chooseList))) c] a] (delay [[b [(force (builtin headList)) c]] [(force (builtin tailList)) c]])]))))";
    
            expect(
                showUPLC( uplc )
            ).toEqual(
                expectedUplcStr
            )
    
        });
    
        test.skip("_recursiveList (requireing other negative natives)", () => {
    
            const uplc = compileIRToUPLC( IRNative._recursiveList );

            // console.log( showUPLC( uplc ) );
            
            expect( showUPLC( uplc ) )
            .toEqual(
                "[(lam a [(lam b [(lam c (lam d (lam e [(lam f [f f]) (lam f (lam g [[[(lam h (lam i (lam l (force (force [[[c l] h] (delay [[i [b l]] [a l]])]))))) [d [f f]]] [e [f f]]] g]))]))) (force (force (builtin chooseList)))]) (force (builtin headList))]) (force (builtin tailList))]"
                // "[(lam a [(lam b [a (lam c [[b b] c])]) (lam b [a (lam c [[b b] c])])]) (lam a (lam b (lam c (lam d [(lam e [[[(lam f (lam g (lam h (force [[[(force (force (builtin chooseList))) h] f] (delay [[g [(force (builtin headList)) h]] [(force (builtin tailList)) h]])])))) [b e]] [c e]] d]) [[a b] c]]))))]"
            )
            
        })
    })

});