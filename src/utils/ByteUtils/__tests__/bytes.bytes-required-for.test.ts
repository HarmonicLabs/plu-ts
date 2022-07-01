import ByetsUtils from ".."

const fullByteOnes = BigInt( 0b1111_1111 );

test("ByetsUtils.minBytesRequiredFor works", () => {

    expect( ByetsUtils.minBytesRequiredForPositive( fullByteOnes ) ).toBe(1);

    expect( ByetsUtils.minBytesRequiredForPositive( fullByteOnes << BigInt( 8 * 10 )) ).toBe(11);

    expect( ByetsUtils.minBytesRequiredForPositive( (( fullByteOnes << BigInt( 8 * 4 ) ) + fullByteOnes) << BigInt( 8 * 15 ) ) ).toBe(20);

    expect(() => ByetsUtils.minBytesRequiredForPositive( -fullByteOnes ) ).toThrow();

})