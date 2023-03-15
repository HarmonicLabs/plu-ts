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

        const h1 = new IRFunc( 1, letted.clone() ).hash

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

})