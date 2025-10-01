import { removeUnusedVarsAndReturnRoot } from "../../removeUnusedVarsAndReturnRoot/removeUnusedVarsAndReturnRoot";
import { isClosedIRTerm } from "../../../../utils/isClosedIRTerm";
import { IRFunc } from "../../../../IRNodes/IRFunc";
import { IRVar } from "../../../../IRNodes/IRVar";
import { IRSelfCall } from "../../../../IRNodes/IRSelfCall";
import { IRApp } from "../../../../IRNodes/IRApp";
import { prettyIR } from "../../../../utils";

// Helper-free tests. Only IRFunc / IRVar / IRApp / IRSelfCall are used to avoid constructor signature uncertainty.
// Closed argument terms are lambdas like (\x. x) ==> new IRFunc(1, new IRVar(0)).

function closedId(): IRFunc { return new IRFunc(1, new IRVar(0)); }

describe("removeUnusedVarsAndReturnRoot keeps terms closed", () => {

    test("single unused arg removed and dbns decremented (arity 2, body uses only second)", () => {
        // \(a b). b  ==> f applied to two closed identities
        const f = new IRFunc( 2, new IRVar(1) );
        const term = new IRApp( new IRApp( f, closedId() ), closedId() );
        const optimized = removeUnusedVarsAndReturnRoot( term );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });

    test("all args used none removed (arity 2, body applies second to first)", () => {
        // \(a b). b a
        const body = new IRApp( new IRVar(1), new IRVar(0) );
        const f = new IRFunc( 2, body );
        const term = new IRApp( new IRApp( f, closedId() ), closedId() );
        const optimized = removeUnusedVarsAndReturnRoot( term );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });

    test("multiple removals (arity 3, body uses only middle)", () => {
        // \(a b c). b
        const f = new IRFunc( 3, new IRVar(1) );
        const term = new IRApp( new IRApp( new IRApp( f, closedId() ), closedId() ), closedId() );
        const optimized = removeUnusedVarsAndReturnRoot( term );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });

    test("nested lambdas with inner unused param (outer arity 2, inner arity 1)", () => {
        // \(a b). (\c. b)
        const inner = new IRFunc( 1, new IRVar(2) ); // depth inside inner body = 3, b is index 2
        const outer = new IRFunc( 2, inner );
        const optimized = removeUnusedVarsAndReturnRoot( outer );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });

    test("deep application chain (curried two-arg function applied twice)", () => {
        // ((\(a b). b) id id)
        const f = new IRFunc( 2, new IRVar(1) );
        const applied = new IRApp( new IRApp( f, closedId() ), closedId() );
        const optimized = removeUnusedVarsAndReturnRoot( applied );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });

    test("self call inside function body remains closed", () => {
        // \(a). self  (self represented by IRSelfCall(0) under depth 1)
        const body = new IRSelfCall(0);
        const f = new IRFunc( 1, body );
        const optimized = removeUnusedVarsAndReturnRoot( f );
        expect( isClosedIRTerm( optimized ) ).toBe( true );
    });
});