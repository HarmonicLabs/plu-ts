import UInt64 from ".."

const _0 = Buffer.from( "0000 0000 0000 0000".split(" ").join(""), "hex" );
const maxUInt64 = Buffer.from( "ffff ffff ffff ffff".split(" ").join(""), "hex" );

test("negative works", () =>
{
    //@ts-ignore
    expect(
        UInt64.fromBigInt( BigInt(1 << 32) << BigInt( 25 )  )
        .negative().to_bigint()
    )
    .toBe(-(BigInt(1 << 32) << BigInt( 25 )) )
})

test("underflow throws", () =>
{
    expect(
        () => UInt64.fromBytes(
            _0
        ).negative()
    ).toThrow("positive to negative conversion underflows")
})

test("overflow throws", () =>
{
    const minNegative = UInt64.fromBytes( maxUInt64 );
    minNegative.dangerouslySetNegativeFlag( true );

    expect(
        () => minNegative.negative()
    ).toThrow("negative to positive conversion overflows")
})