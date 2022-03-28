import ObjectUtils from ".."

const uniqueKeyObj = {
    unique: [
        "key",
        {
            value: "can be anything"
        }
    ]
}

const threeKeyObj = {
    one: 1,
    two: "two",
    three: () => 3
}

test("has unique key works with both key provided or not", () => {

    expect( ObjectUtils.hasUniqueKey( uniqueKeyObj ) ).toBe(true);

    expect( ObjectUtils.hasUniqueKey( uniqueKeyObj, "unique" ) ).toBe(true);
    expect( ObjectUtils.hasUniqueKey( uniqueKeyObj, "anOtherKey" ) ).toBe(false);

    expect( ObjectUtils.hasUniqueKey( threeKeyObj ) ).toBe(false);
    expect( ObjectUtils.hasUniqueKey( threeKeyObj, "one" ) ).toBe(false);
    expect( ObjectUtils.hasUniqueKey( threeKeyObj, "three" ) ).toBe(false);

})