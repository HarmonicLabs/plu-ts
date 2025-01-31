import { IRFunc } from "../IRFunc";
import { IRVar } from "../IRVar"


describe("IRFunc.body", () => {

    test("same body", () => {

        const body = new IRVar(0);

        const func = new IRFunc(
            1,
            body
        );

        expect(
            func.body
        ).toEqual(
            body
        );
        
    })
})