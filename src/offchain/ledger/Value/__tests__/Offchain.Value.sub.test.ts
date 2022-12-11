import Hash32 from "../../../hashes/Hash32/Hash32";
import Value from "../Value"


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

        test("1a - 1b = 1a ( policy ) ", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash32( "aa".repeat(32) ),
                            assets: { a: 1 }
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash32( "bb".repeat(32) ),
                            assets: { b: 1 }
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash32( "aa".repeat(32) ),
                        assets: { a: 1 }
                    }
                ])
            );
        })

        test("1a.a - 1a.b = 1a.a ( assetName ) ", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash32( "aa".repeat(32) ),
                            assets: { a: 1 }
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash32( "aa".repeat(32) ),
                            assets: { b: 1 }
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash32( "aa".repeat(32) ),
                        assets: { a: 1 }
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
                            policy: new Hash32( "aa".repeat(32) ),
                            assets: { "a": 1 }
                        },
                        {
                            policy: new Hash32( "bb".repeat(32) ),
                            assets: { "b": 3 }
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash32( "bb".repeat(32) ),
                            assets: { "b": 2 }
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash32( "bb".repeat(32) ),
                        assets: { "b": 1n }
                    },
                    {
                        policy: new Hash32( "aa".repeat(32) ),
                        assets: { "a": 1 }
                    }
                ])
            );

        });

        test("1a.a 3b.a + 2b.b = 1a.a 3b.a (different names)", () => {

            expect(
                Value.sub(
                    new Value([
                        {
                            policy: new Hash32( "aa".repeat(32) ),
                            assets: { "a": 1 }
                        },
                        {
                            policy: new Hash32( "bb".repeat(32) ),
                            assets: { "a": 3 }
                        }
                    ]),
                    new Value([
                        {
                            policy: new Hash32( "bb".repeat(32) ),
                            assets: { "b": 2 }
                        }
                    ])
                )
            ).toEqual(
                new Value([
                    {
                        policy: new Hash32( "aa".repeat(32) ),
                        assets: { "a": 1 }
                    },
                    {
                        policy: new Hash32( "bb".repeat(32) ),
                        assets: { "a": 3 }
                    }
                ])
            );
        });

    })

})