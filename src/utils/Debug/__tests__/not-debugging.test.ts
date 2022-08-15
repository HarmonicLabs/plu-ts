import Debug from ".."

test.skip( "remember to set Debug manually to false before a commit", () => {
    // src/utils/Debug; set global '_isDebugging' to false
    expect( Debug.isDeugging() ).toBe(false);
});