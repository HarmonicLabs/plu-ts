import { Hash28 } from "../../../hashes/Hash28/Hash28";
import { Value } from "../Value"

describe("for entry of value", () => {

    test("zero", () => {

        let n = 0;
        const value = Value.zero;

        for(const { policy, assets } of value)
        {
            expect( policy ).toEqual("");
            expect(assets).toEqual({ "": 0 });
            n++;
        }

        expect(n).toBe(1);
    });

    test("lovelaces", () => {

        let n = 0;
        const value = Value.lovelaces(1e6);

        for(const { policy, assets } of value)
        {
            expect( policy ).toEqual("");
            expect(assets).toEqual({ "": 1e6 });
            n++;
        }

        expect(n).toBe(1);
    });

    test("multi-asset", () => {

        let n = 0;
        const value = new Value([
            {
                policy: new Hash28("ff".repeat(28)),
                assets: { "": 22 }
            },
            {
                policy: new Hash28("aa".repeat(28)),
                assets: { "": 22 }
            },
            {
                policy: new Hash28("dd".repeat(28)),
                assets: { "": 22 }
            },
        ]);

        for(const { policy, assets } of value)
        {
            expect( typeof policy ).toBe("string");
            expect( typeof assets ).toBe("object");
            expect( Array.isArray( assets ) ).toBe(false);
            expect( assets === null ).toBe(false);
            n++;
        }

        expect(n).toBe(4);
    });
})