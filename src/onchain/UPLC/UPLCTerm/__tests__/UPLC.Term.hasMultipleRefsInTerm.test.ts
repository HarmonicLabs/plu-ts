import { hasMultipleRefsInTerm } from "..";
import { Application } from "../../UPLCTerms/Application";
import { Builtin } from "../../UPLCTerms/Builtin";
import { Lambda } from "../../UPLCTerms/Lambda";
import { UPLCConst } from "../../UPLCTerms/UPLCConst";
import { UPLCVar } from "../../UPLCTerms/UPLCVar";

describe("hasMultipleRefsInTerm", () => {

    test("returns false on no referneces", () => {

        const uselessApplication = new Application(
            new Lambda( UPLCConst.unit ),
            UPLCConst.unit
        );

        expect(
            hasMultipleRefsInTerm(
                -1,
                uselessApplication
            )
        ).toBe( false );

        expect(
            hasMultipleRefsInTerm(
                0,
                uselessApplication
            )
        ).toBe( false );

        expect(
            hasMultipleRefsInTerm(
                1,
                uselessApplication
            )
        ).toBe( false );

    })

    test("returns false on single references", () => {

        const baseExprNoMuti =
        new Application(
            new Application(
                Builtin.lessThanEqualInteger,
                new UPLCVar( 0 )
            ),
            new UPLCVar( 1 )
        );

        const appliedExprNoMuti =
        new Application(
            new Application(
                new Lambda(
                    new Lambda(
                        baseExprNoMuti
                    )
                ),
                UPLCConst.int( 2 )
            ),
            UPLCConst.int( 3 )
        );

        function testSingleRefs( dbn: number ): void
        {
            expect(
                hasMultipleRefsInTerm(
                    dbn, baseExprNoMuti
                )
            ).toBe( false );
    
            expect(
                hasMultipleRefsInTerm(
                    dbn-2, appliedExprNoMuti
                )
            ).toBe( false );
        }
        
        testSingleRefs( -1 );
        testSingleRefs( 0 );
        testSingleRefs( 1 );

    })

    test("returns true on two refs", () => {

        const baseExprMulti =
        new Application(
            new Application(
                Builtin.lessThanEqualInteger,
                new UPLCVar( 0 )
            ),
            new UPLCVar( 0 )
        );
        
        const appliedExprMulti =
        new Application(
            new Lambda(
                baseExprMulti
            ),
            UPLCConst.int( 42 )
        );

        expect(
            hasMultipleRefsInTerm(  0, baseExprMulti )
        ).toBe( true );

        expect(
            hasMultipleRefsInTerm( -1, appliedExprMulti )
        ).toBe( true );


        expect(
            hasMultipleRefsInTerm( -1, baseExprMulti )
        ).toBe( false );

        expect(
            hasMultipleRefsInTerm(  1, baseExprMulti )
        ).toBe( false );
        
        expect(
            hasMultipleRefsInTerm( -2, appliedExprMulti )
        ).toBe( false );

        expect(
            hasMultipleRefsInTerm(  0, appliedExprMulti )
        ).toBe( false );

    })

    
})