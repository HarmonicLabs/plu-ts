import { int } from "../../../../../type_system"
import { IRConst } from "../../../../IRNodes/IRConst"
import { IRDelayed } from "../../../../IRNodes/IRDelayed"
import { IRForced } from "../../../../IRNodes/IRForced"
import { IRFunc } from "../../../../IRNodes/IRFunc"
import { IRLetted, getLettedTerms } from "../../../../IRNodes/IRLetted"
import { IRVar } from "../../../../IRNodes/IRVar"
import { _getMinUnboundDbn } from "../groupByScope"

describe("_getMinUnboundDbn", () => {

    test("no vars", () => {

        const root = new IRForced(
            new IRDelayed(
                new IRLetted(
                    0,
                    new IRConst( int, 2 )
                )
            )
        );

        const lettedInRoot = getLettedTerms( root );

        expect(
            _getMinUnboundDbn( root )
        ).toBe( undefined )

    });

    test("in scope", () => {
        
        const inScope = new IRFunc( 1,
            new IRLetted(
                1,
                new IRVar( 0 )
            )
        );

        expect(
            _getMinUnboundDbn( inScope )
        ).toBe( undefined );

    })

    test("out of scope", () => {
        
        const letted  =new IRLetted(
            1,
            new IRVar( 0 )
        );

        const outScope = new IRFunc( 1,
            letted
        );

        expect(
            _getMinUnboundDbn( letted.value )
        ).toBe( 0 );

    });

    test("in scope 2", () => {
        
        const inScope = new IRFunc( 2,
            new IRLetted(
                2,
                new IRVar( 1 )
            )
        );

        expect(
            _getMinUnboundDbn( inScope )
        ).toBe( undefined );

    });

})