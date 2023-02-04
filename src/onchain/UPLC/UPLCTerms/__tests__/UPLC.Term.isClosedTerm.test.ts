import { UPLCTerm, isClosedTerm } from "../../UPLCTerm"
import { Delay } from "../Delay";
import { Lambda } from "../Lambda";
import { UPLCVar } from "../UPLCVar"


describe("isClosedTerm", () => {

    describe("UPLCVar", () => {
        
        test("UPLCVar( 0 ) : false", () => {
            
            expect(
                isClosedTerm( new UPLCVar( 0 ) )
            ).toBe( false );
    
        })
    
        test("UPLCVar( 1 ) : false", () => {
            
            expect(
                isClosedTerm( new UPLCVar( 1 ) )
            ).toBe( false );
            
        });

    });

    describe("Delay", () => {
        
        test("equals arg result", () => {

            function testforInnerTerm( innerTerm: UPLCTerm )
            {
                expect(
                    isClosedTerm(
                        new Delay( innerTerm )
                    )
                ).toBe( isClosedTerm( innerTerm ) )
            }

            testforInnerTerm( new UPLCVar(0) );
            testforInnerTerm( new UPLCVar(1) );
            testforInnerTerm( new Lambda( new UPLCVar(0) ) );
            testforInnerTerm( new Lambda( new UPLCVar(1) ) );
            testforInnerTerm( new Lambda( new UPLCVar(2) ) );
            
        })

    });

    describe("Lambda", () => {
        
        test("id: true", () => {

            expect(
                isClosedTerm( new Lambda( new UPLCVar(0) ) )
            ).toBe( true );
            
            expect(
                isClosedTerm( new Lambda( new UPLCVar(1) ) )
            ).toBe( false );
        })

    });

    test.todo("Application");
    test.todo("Const");
    test.todo("Force");
    test.todo("Error");
    test.todo("Builtin");
    test.todo("Hoisted");

})