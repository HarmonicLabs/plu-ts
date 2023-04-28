import { fromAscii } from "@harmoniclabs/uint8array-utils"
import { Hash28 } from "../../../hashes/Hash28/Hash28"
import { isIValue } from "../IValue"

describe("isIValue", () => {

    test("no double policy", () => {

        expect( isIValue([
            {
                policy: new Hash28( "aa".repeat(28) ),
                assets: [{ name: fromAscii( "a" ), quantity: 1 }]
            },
            {
                policy: new Hash28( "bb".repeat(28) ),
                assets: [{ name: fromAscii( "a" ), quantity: 3 }]
            },
            {
                policy: new Hash28( "bb".repeat(28) ),
                assets: [{ name: fromAscii( "b" ), quantity: -2 }]
            }
        ])
        ).toBe( false )
    
        expect(
            isIValue([
                {
                    policy: new Hash28( "aa".repeat(28) ),
                    assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                },
                {
                    policy: new Hash28( "bb".repeat(28) ),
                    assets: [
                        { name: fromAscii( "a" ), quantity: 1 },
                        { name: fromAscii( "b" ), quantity: -2 }
                    ]
                }
            ])
        ).toBe( true )

    })


})