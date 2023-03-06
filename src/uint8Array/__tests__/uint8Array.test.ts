import { fromHex, toHex } from "../index";

function randArr(): number[]
{
    const len = Math.round(Math.random() * 1024);
    const arr = new Array( len );
    for( let i = 0; i < len; i++ )
    {
        arr[i] = Math.round(Math.random() * 255);
    }
    return arr;
}

describe("uint8Array", () => {

    describe("hex", () => {
        
        describe("toHex", () => {
    
            test("base", () => {
                expect(
                    toHex(new Uint8Array([25, 36, 49]))
                ).toEqual(
                    "192431"
                )
            })

            test("throws on non Uint8Array", () => {

                expect(
                    () => toHex([25, 36, 49] as any)
                ).toThrow()

            })
    
        });
    
        describe("fromHex", () => {
    
            test("base", () => {
                expect(
                    fromHex("192431")
                ).toEqual(
                    new Uint8Array([25, 36, 49])
                )
            });

            test("case insensitive", () => {

                expect(
                    fromHex(
                        "DEADBEEF"
                    )
                ).toEqual(
                    fromHex(
                        "deadbeef"
                    )
                );

            });

            test("throws on non hex", () => {

                expect(
                    () => fromHex(
                        "0DEADBEEFG"
                    )
                ).toThrow()

            })
    
        });

        test("fromHex(toHex( x )) === x", () => {

            for( let i = 0; i < 10; i++ )
            {
                const buf = new Uint8Array( randArr() );
                expect(
                    fromHex(
                        toHex(
                            buf
                        )
                    )
                ).toEqual(
                    buf
                )
            }

        })

    })

})