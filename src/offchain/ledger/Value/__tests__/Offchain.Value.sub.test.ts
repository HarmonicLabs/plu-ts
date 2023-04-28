import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { Hash28 } from "../../../hashes/Hash28/Hash28";
import { Value } from "../Value"


describe("Value.sub", () => {

    test("0 - 0 = 0", () => {

        expect(
            Value.sub(
                Value.zero,
                Value.zero
            )
        ).toEqual(Value.zero);

    });

    test("0 - 1 = -1", () => {

        expect(
            Value.sub(
                Value.zero,
                Value.lovelaces( 1 )
            )
        ).toEqual(Value.lovelaces(-1n));
        
    });

    test("1 - 1 = 0", () => {

        expect(
            Value.sub(
                Value.lovelaces( 1 ),
                Value.lovelaces( 1 )
            )
        ).toEqual(Value.zero);
        
    });

    test("1 - (-1) = 2", () => {

        expect(
            Value.sub(
                Value.lovelaces( 1 ),
                Value.lovelaces( -1 )
            )
        ).toEqual(Value.lovelaces(2n));
        
    });

    describe("unrelated assets", () => {

        test("1a - 1b = 1a - 1b ( policy ) ", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: fromAscii( "b" ), quantity: 1 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                    },
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [{ name: fromAscii( "b" ), quantity: -1n }]
                    }
                ])
            );
        })

        test("1a.a - 1a.b = 1a.a - 1a.b ( assetName ) ", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: fromAscii( "b" ), quantity: 1 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [
                            { name: fromAscii( "a" ), quantity: 1 },
                            { name: fromAscii( "b" ), quantity: -1n }
                        ]
                    }
                ])
            )
            
        });

    });


    describe("multi assets", () => {

        test("1a3b - 2b = 1a1b (policy)", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                        },
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: fromAscii( "b" ), quantity: 3 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: fromAscii( "b" ), quantity: 2 }]
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [{ name: fromAscii( "b" ), quantity: 1n }]
                    },
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                    }
                ])
            );

        });

        test("1a.a 3b.a - 2b.b = 1a.a 3b.a -2b.b (different names)", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash28( "aa".repeat(28) ),
                            assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                        },
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: fromAscii( "a" ), quantity: 3 }]
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash28( "bb".repeat(28) ),
                            assets: [{ name: fromAscii( "b" ), quantity: 2 }]
                        }
                    ])
                ).toJson()
            ).toEqual(
                new Value([
                    {
                        policy: new Hash28( "aa".repeat(28) ),
                        assets: [{ name: fromAscii( "a" ), quantity: 1 }]
                    },
                    {
                        policy: new Hash28( "bb".repeat(28) ),
                        assets: [
                            { name: fromAscii( "a" ), quantity: 3 },
                            { name: fromAscii( "b" ), quantity: -2 }
                        ]
                    }
                ]).toJson()
            );
        });

    })

})