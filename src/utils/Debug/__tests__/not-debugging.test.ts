import Debug from ".."

test.skip( "remember to set Debug manually to false before a commit", () => {

    expect( Debug.isDeugging() ).toBe(false);

});