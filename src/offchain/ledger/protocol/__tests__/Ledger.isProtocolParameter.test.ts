import { defaultProtocolParameters, isProtocolParameters } from "../ProtocolParameters"


describe("Ledger.isProtocolParameter", () => {

    test("defaultProtocolParamters", () => {

        expect(
            isProtocolParameters( defaultProtocolParameters )
        ).toBe( true );

    })
})