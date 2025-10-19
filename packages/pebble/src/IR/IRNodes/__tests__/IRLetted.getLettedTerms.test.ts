import { IRApp } from "../IRApp";
import { IRConst } from "../IRConst";
import { IRDelayed } from "../IRDelayed";
import { IRForced } from "../IRForced";
import { IRLetted, getLettedTerms } from "../IRLetted";
import { IRNative } from "../IRNative";
import { IRNativeTag } from "../IRNative/IRNativeTag";

describe("getLettedTerms", () => {

    test("single letted", () => {

        const sym = Symbol("x");
        const root = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRLetted(
                        sym,
                        new IRApp(
                            new IRNative( IRNativeTag.addInteger ),
                            IRConst.int( 2 )
                        )
                    ),
                    IRConst.int( 2 )
                )
            )
        );

        expect( getLettedTerms( root ).length ).toEqual( 1 );
        
    })
})