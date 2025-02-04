import { int } from "../../../type_system/types";
import { IRApp } from "../IRApp";
import { IRConst } from "../IRConst";
import { IRDelayed } from "../IRDelayed";
import { IRForced } from "../IRForced";
import { IRLetted, getLettedTerms } from "../IRLetted";
import { IRNative } from "../IRNative";
import { IRNativeTag } from "../IRNative/IRNativeTag";

describe("getLettedTerms", () => {

    test("single letted", () => {

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
        
    })
})