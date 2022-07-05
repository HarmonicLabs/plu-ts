import Debug from ".."

test( "remember to set Debug manually to false before a commit", () => {

    expect( Debug.isDeugging() ).toBe(false);

});