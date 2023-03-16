import { toHex } from "@harmoniclabs/uint8array-utils";
import { int, lam, tyVar } from "../../../../pluts/type_system/types";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRConst } from "../../../IRNodes/IRConst";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRLetted, getLettedTerms } from "../../../IRNodes/IRLetted";
import { IRNative } from "../../../IRNodes/IRNative";
import { IRNativeTag } from "../../../IRNodes/IRNative/IRNativeTag";
import { IRVar } from "../../../IRNodes/IRVar";
import { _addDepth } from "../../_internal/_addDepth";
import { handleLetted } from "../handleLetted";
import { logJson } from "../../../../../utils/ts/ToJson";

describe("handleLetted", () => {

    test("single ref inlined", () => {

        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRLetted(
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

        handleLetted( root );

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

        _addDepth( expected );

        expect( getLettedTerms( root ) ).toEqual([]);
        expect( fstHash ).not.toEqual( root.hash );
        expect( root.hash ).toEqual( expected.hash );
        
    });

    test("two refs hoisted", () => {

        const letted = new IRLetted(
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

        const fstHash = root.hash.slice();

        handleLetted( root );

        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRFunc(
                        1,
                        new IRApp(
                            new IRVar( 0 ),
                            new IRApp(
                                new IRVar( 0 ),
                                new IRConst( int, 2 )
                            )
                        )
                    ),
                    letted.value.clone()
                )
            )
        );

        _addDepth( expected );

        expect( getLettedTerms( root ) ).toEqual([]);
        expect( fstHash ).not.toEqual( root.hash );
        expect( root.hash ).toEqual( expected.hash );
        
    });

    test("two refs hoisted with different DeBruijn", () => {

        const letted = new IRLetted(
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

        const fstHash = root.hash.slice();

        handleLetted( root );

        const expected = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRFunc(
                        1,
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
                    ),
                    letted.value.clone()
                )
            )
        );

        expect( getLettedTerms( root ) ).toEqual([]);
        expect( fstHash ).not.toEqual( root.hash );
        
        expect( root.toJson() ).toEqual( expected.toJson() );

        expect( toHex( root.hash ) )
        .toEqual( toHex( expected.hash ) )
        
    });

    test("single letted with single dependency", () => {

        // `add2`
        const dep = new IRLetted(
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // console.log( dep.parent ); // undefined

        // fancy `add4`
        const lettedWithDep = new IRLetted(
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

        const root = new IRForced(
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

        handleLetted( root );

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

        expect( root.toJson() ).toEqual( expected.toJson() );
        expect( root.hash ).toEqual( expected.hash );

    });

    test("dependency reused", () => {

        // `add2`
        const dep = new IRLetted(
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // fancy `add4`
        const lettedWithDep = new IRLetted(
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

        handleLetted( root );

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

        expect( root.toJson() ).toEqual( expected.toJson() );
        expect( root.hash ).toEqual( expected.hash );

    });

    test("vars outside and inside", () => {

        const letted = new IRLetted( new IRConst( int, 2 ) );
        
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

        handleLetted( root );

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

        expect( root.toJson() ).toEqual( expected.toJson() );
        expect( root.hash ).toEqual( expected.hash );

    })

})