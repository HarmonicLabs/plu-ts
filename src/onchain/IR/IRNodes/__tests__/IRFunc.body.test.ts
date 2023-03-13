import { lam, tyVar } from "../../../pluts";
import { IRFunc } from "../IRFunc";
import { IRVar } from "../IRVar"


describe("IRFunc.body", () => {

    test("same body", () => {

        const body = new IRVar(0);

        const func = new IRFunc(
            lam( tyVar(), tyVar() ),
            body
        );

        expect(
            func.body
        ).toEqual(
            body
        );
    })
})