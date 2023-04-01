import { toHex } from "@harmoniclabs/uint8array-utils";
import { data, int } from "../../../../../pluts/type_system/types";
import { IRApp } from "../../../../IRNodes/IRApp";
import { IRConst } from "../../../../IRNodes/IRConst";
import { IRDelayed } from "../../../../IRNodes/IRDelayed";
import { IRForced } from "../../../../IRNodes/IRForced";
import { IRFunc } from "../../../../IRNodes/IRFunc";
import { IRLetted, getLettedTerms } from "../../../../IRNodes/IRLetted";
import { IRNative } from "../../../../IRNodes/IRNative";
import { IRNativeTag } from "../../../../IRNodes/IRNative/IRNativeTag";
import { IRVar } from "../../../../IRNodes/IRVar";
import { handleLetted } from "..";
import { IRTerm } from "../../../../IRTerm";
import { _ir_apps } from "../../../../tree_utils/_ir_apps";
import { IRHoisted } from "../../../../IRNodes/IRHoisted";
import { compileIRToUPLC } from "../../../compileIRToUPLC";
import { showUPLC } from "../../../../../UPLC/UPLCTerm";
import { DataI } from "../../../../../../types/Data";
import { Machine, pInt } from "../../../../..";

describe("handleLetted", () => {

    test("single ref inlined", () => {

        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRLetted(
                        0,
                        new IRApp(
                            new IRNative( IRNativeTag.addInteger ),
                            new IRConst( int, 2 )
                        )
                    ),
                    new IRConst( int, 2 )
                )
            )
        );

        expect( getLettedTerms( root ).length ).toEqual( 1 );

        const fstHash = root.hash.slice();

        const compiled = compileIRToUPLC( root );

        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRApp(
                        new IRNative( IRNativeTag.addInteger ),
                        new IRConst( int, 2 )
                    ),
                    new IRConst( int, 2 )
                )
            )
        );

        expect(
            compiled
        ).toEqual(
            compileIRToUPLC(
                expected
            )
        )
    });

    test("two refs hoisted", () => {

        const letted = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    letted,
                    new IRApp(
                        letted.clone(),
                        new IRConst( int, 2 )
                    )
                )
            )
        );


        expect( getLettedTerms( root ).length ).toEqual( 2 );

        const compiled = compileIRToUPLC( root );

        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRHoisted(
                        letted.clone().value
                    ),
                    new IRApp(
                        new IRHoisted(
                            letted.clone().value
                        ),
                        new IRConst( int, 2 )
                    )
                )
            )
        );

        expect(
            compiled
        ).toEqual(
            compileIRToUPLC(
                expected
            )
        )
        
    });

    test("two refs hoisted with different DeBruijn", () => {

        const letted = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    letted,
                    new IRApp(
                        new IRApp(
                            new IRFunc( 1, letted.clone() ), // useless function
                            new IRConst( int, 0 )
                        ),
                        new IRConst( int, 2 )
                    )
                )
            )
        );

        // logJson( root )

        expect( getLettedTerms( root ).length ).toEqual( 2 );

        const compiled = compileIRToUPLC( root );

        const expected = new IRFunc(
            1,
            new IRApp(
                new IRForced(
                    new IRDelayed(
                        new IRApp(
                            new IRVar( 0 ),
                            new IRApp(
                                new IRApp(
                                    new IRFunc( 1, new IRVar(1) ), // useless function
                                    new IRConst( int, 0 )
                                ),
                                new IRConst( int, 2 )
                            )
                        )
                    )
                ),
                letted.value.clone()
            )
        );

        const expectedCompiled = compileIRToUPLC(
            expected
        );

        expect(
            showUPLC( compiled )
        ).toEqual(
            "[(lam a (force (delay [a [[(lam b a) (con integer 0)] (con integer 2)]]))) [(builtin addInteger) (con integer 2)]]"
        )
        
    });

    test("single letted with single dependency", () => {

        // `add2`
        const dep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // console.log( dep.parent ); // undefined

        // fancy `add4`
        const lettedWithDep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRApp(
                    dep,
                    new IRConst( int, 2 )
                )
            )
        );

        // console.log( lettedWithDep.parent ); // undefined
        // console.log( dep.parent ); // IRAPP

        let root: IRTerm = new IRForced(
            new IRDelayed(
                new IRApp(
                    lettedWithDep,
                    new IRConst( int, 2 )
                )
            )
        );

        // console.log( lettedWithDep.parent ); // IRApp

        const lettedInRoot = getLettedTerms( root );
        expect( lettedInRoot.length ).toEqual( 1 );


        // logJson( root, 4 )

        // all inlined
        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRApp(
                        new IRNative( IRNativeTag.addInteger ),
                        new IRApp(
                            new IRApp(
                                new IRNative( IRNativeTag.addInteger ),
                                new IRConst( int, 2 )
                            ),
                            new IRConst( int, 2 )
                        )
                    ),
                    new IRConst( int, 2 )
                )
            )
        );

        // logJson( root, 4 )

        const compiled = compileIRToUPLC( root );

        expect(
            showUPLC( compiled )
        ).toEqual("(force (delay [[(builtin addInteger) [[(builtin addInteger) (con integer 2)] (con integer 2)]] (con integer 2)]))")

    });

    test("dependency reused", () => {

        // `add2`
        const dep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // fancy `add4`
        const lettedWithDep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRApp(
                    dep,
                    new IRConst( int, 2 )
                )
            )
        );

        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    lettedWithDep,
                    new IRApp(
                        dep.clone(), // clone is essential (we override `parent` otherwhise)
                        new IRConst( int, 2 )
                    )
                )
            )
        );

        const lettedInRoot = getLettedTerms( root );
        expect( lettedInRoot.length ).toEqual( 2 );

        // all inlined
        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRFunc( 1,
                        new IRApp( // least common ancestor
                            new IRApp(
                                new IRNative( IRNativeTag.addInteger ),
                                new IRApp(
                                    new IRVar(0),
                                    new IRConst( int, 2 )
                                )
                            ),
                            new IRApp(
                                new IRVar( 0 ),
                                new IRConst( int, 2 )
                            )
                        )
                    ),
                    new IRApp(
                        new IRNative( IRNativeTag.addInteger ),
                        new IRConst( int, 2 )
                    )
                )
            )
        );

        const compiled = compileIRToUPLC( root );

        expect( showUPLC( compiled ) )
        .toEqual("[(lam a (force (delay [[(builtin addInteger) [a (con integer 2)]] [a (con integer 2)]]))) [(builtin addInteger) (con integer 2)]]")
    });

    test("vars outside and inside", () => {

        const letted = new IRLetted( 0, new IRConst( int, 2 ) );
        
        const root = new IRFunc( 2, // a, b
            new IRApp(
                new IRApp(
                    new IRFunc( 2, // c, d
                        new IRApp(
                            new IRApp(
                                IRNative.addInteger,
                                new IRVar( 3 ) // a
                            ),
                            new IRVar( 1 ) // c
                        )
                    ),
                    letted.clone()
                ),
                letted.clone()
            )
        );

        const compiled = compileIRToUPLC( root );

        expect( showUPLC( compiled ) )
        .toEqual("[(lam a (lam b (lam c [[(lam d (lam e [[(builtin addInteger) b] d])) a] a]))) (con integer 2)]");

        // all inlined
        const expected = new IRFunc( 2, // a, b
            new IRApp(
                new IRFunc( 1,
                    new IRApp( // lowest common ancestor
                        new IRApp(
                            new IRFunc( 2, // c, d
                                new IRApp(
                                    new IRApp(
                                        IRNative.addInteger,
                                        new IRVar( 4 ) // a incremented
                                    ),
                                    new IRVar( 1 ) // c stays the same
                                )
                            ),
                            new IRVar( 0 )
                        ),
                        new IRVar( 0 )
                    )
                ), 
                letted.value.clone()
            )  
        );

    });


    test("letted term hoisted correctly", () => {

        const funcArity = 1;

        const lettedDoubled = new IRLetted(
            1,
            new IRApp(
                new IRFunc( 1,
                    _ir_apps(
                        IRNative.addInteger,
                        new IRVar( 0 ),
                        new IRVar( 0 )
                    )
                ),
                new IRVar(0)
            )
        )
        const quadrupleIR = new IRFunc(
            funcArity,
            _ir_apps(
                IRNative.addInteger,
                lettedDoubled.clone(),
                lettedDoubled.clone()
            )
        );

        const newIR = quadrupleIR.clone();

        // console.log( showIR( newIR ) );

        handleLetted( newIR );

        const expected = new IRFunc(
            funcArity,
            new IRApp(
                new IRFunc( 1,
                    _ir_apps(
                        IRNative.addInteger,
                        new IRVar( 0 ),
                        new IRVar( 0 )
                    )
                ),
                lettedDoubled.value
            )
        ); 

        // console.log( showIR( newIR ) );
        // console.log( showIR( expected ) );

        expect( newIR.toJson() )
        .toEqual( expected.toJson() )
    });

    test("strange edge case", () => {

        const theLetted = new IRLetted(
            1,
            new IRApp(
                IRNative.unIData,
                new IRApp(
                    IRNative.headList,
                    new IRVar( 0 )
                )
            )
        );

        expect(
            toHex(
                theLetted.hash
            )
        ).toEqual( "b10af49d9972df4e111157e429de5d67" );

        const sndListHoisted = new IRHoisted(
            new IRFunc( 1,
                new IRApp(
                    IRNative.headList,
                    new IRApp(
                        IRNative.tailList,
                        new IRVar( 0 )
                    )
                )
            )
        );

        expect(
            toHex(
                sndListHoisted.hash
            )
        ).toEqual("be17b4da0ec7040993ba0f252c778052");

        const theOtherLetted = new IRLetted(
            1,
            new IRApp(
                IRNative.unIData,
                new IRApp(
                    sndListHoisted.clone(),
                    new IRVar( 0 )
                )
            )
        );

        expect(
            toHex(
                theOtherLetted.hash
            )
        ).toEqual("ae90f0c6c803c113073c04addcbd7020");

        const edgeCase = new IRFunc( 1,
            _ir_apps(
                IRNative.addInteger,
                theLetted.clone(),
                _ir_apps(
                    IRNative.addInteger,
                    theLetted.clone(),
                    theOtherLetted.clone()
                )
            )
        );

        const appliedEdgeCase = new IRApp(
            edgeCase.clone(),
            IRConst.listOf( data )([
                new DataI( 2 ),
                new DataI( 3 )
            ])
        );

        // console.log( showIR( edgeCase ) );
        // const uplc = compileIRToUPLC( edgeCase );
        // console.log( prettyUPLC( uplc, 2 ) );

        expect(
            Machine.evalSimple(
                compileIRToUPLC(appliedEdgeCase)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 7 )
            )
        );

    })

})