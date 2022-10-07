import { int, str, struct, tyVar } from ".."
import { structExtends } from "../extension";

const a = tyVar("a");

const maybeT = struct({
    Just: { value: int },
    Nothing: {}
})

describe("structExtends", () => {

    test("any TermType as first argument", () => {

        expect(
            structExtends(
                int,
                struct({
                    Ctor: {}
                })
            )
        ).toBe( false )

    })


    describe("non generic", () => {

        test("same struct", () => {
    
            expect(
                structExtends(
                    struct({
                        Ctor: {
                            some_field: int
                        }
                    }),
                    struct({
                        Ctor: {
                            some_field: int
                        }
                    })
                )
            ).toBe( true )
    
            expect(
                structExtends(
                    struct({
                        NoFields: {},
                        Single: {
                            some_field: int
                        },
                        Double: {
                            fst: int,
                            snd: str
                        }
                    }),
                    struct({
                        NoFields: {},
                        Single: {
                            some_field: int
                        },
                        Double: {
                            fst: int,
                            snd: str
                        }
                    })
                )
            ).toBe( true )
    
        });

        test("different constructors order", () => {

            expect(
                structExtends(
                    struct({
                        Just: { value: int },
                        Nothing: {}
                    }),
                    struct({
                        Nothing: {},
                        Just: { value: int }
                    })
                )
            ).toBe( false );

        })

        test("different fields order", () => {

            expect(
                structExtends(
                    struct({
                        SomeCtor: {
                            fst: int,
                            snd: str
                        }
                    }),
                    struct({
                        SomeCtor: {
                            snd: str,
                            fst: int
                        }
                    })
                )
            ).toBe( false );

        })
    });

    describe("generic", () => {

        const a = tyVar("a"); 
        const b = tyVar("b"); 
        const c = tyVar("c"); 
        const d = tyVar("d");

        test("tyVars in the same place eare ok", () => {

            expect(
                structExtends(
                    struct({
                        Ctor: { field: a }
                    }),
                    struct({
                        Ctor: { field: b }
                    })
                )
            ).toBe( true )
        })

    })

})