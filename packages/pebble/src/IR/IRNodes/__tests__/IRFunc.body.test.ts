import { IRFunc } from "../IRFunc";
import { IRVar } from "../IRVar"


describe("IRFunc.body", () => {

    test("same body", () => {

        const sym = Symbol("x");
        const body = new IRVar(sym);

        const func = new IRFunc(
            [ sym ],
            body
        );

        expect(
            func.body
        ).toEqual(
            body
        );
        
    })
})