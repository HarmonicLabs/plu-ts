import { Hash28 } from "../../../hashes/Hash28/Hash28";
import { Value } from "../Value"

describe("for entry of value", () => {

    test("zero", () => {

        let n = 0;
        const value = Value.zero;

        for(const { policy, assets } of value)
        {
            expect( policy ).toEqual("");
            expect(assets).toEqual([{ name: new Uint8Array([]), quantity: 0 }]);
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
            expect(assets).toEqual([
                {
                    name: new Uint8Array([]),
                    quantity: 1e6
                }
            ]);
            n++;
        }

        expect(n).toBe(1);
    });

    test("multi-asset", () => {

        let n = 0;
        const value = new Value([
            {
                policy: new Hash28("ff".repeat(28)),
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: 22
                    }
                ]
            },
            {
                policy: new Hash28("aa".repeat(28)),
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: 22
                    }
                ]
            },
            {
                policy: new Hash28("dd".repeat(28)),
                assets: [
                    {
                        name: new Uint8Array([]),
                        quantity: 22
                    }
                ]
            },
        ]);

        for(const { policy, assets } of value)
        {
            expect( typeof policy ).toBe("string");
            expect( typeof assets ).toBe("object");
            expect( Array.isArray( assets ) ).toBe(true);
            n++;
        }

        expect(n).toBe(4);
    });
})