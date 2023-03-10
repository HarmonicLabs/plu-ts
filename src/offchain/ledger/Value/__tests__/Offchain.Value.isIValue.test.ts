import { Hash28 } from "../../../hashes/Hash28/Hash28"
import { isIValue } from "../IValue"

describe("isIValue", () => {

    test("no double policy", () => {

        expect( isIValue([
            {
                policy: new Hash28( "aa".repeat(28) ),
                assets: { "a": 1 }
            },
            {
                policy: new Hash28( "bb".repeat(28) ),
                assets: { "a": 3 }
            },
            {
                policy: new Hash28( "bb".repeat(28) ),
                assets: { "b": -2 }
            }
        ])
        ).toBe( false )
    
        expect(
            isIValue([
                {
                    policy: new Hash28( "aa".repeat(28) ),
                    assets: { "a": 1 }
                },
                {
                    policy: new Hash28( "bb".repeat(28) ),
                    assets: { "a": 3, "b": -2 }
                }
            ])
        ).toBe( true )

    })


})