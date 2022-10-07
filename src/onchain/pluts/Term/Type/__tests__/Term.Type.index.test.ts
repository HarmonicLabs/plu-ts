import Type from ".."


describe("Types definiton", () => {

    test("Type obj", () => {

        expect( Type ).not.toBe( undefined ); // circular deps
        console.log( Type );

    })
})