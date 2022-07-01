import JsRuntime from "..";

/** 
 * CONVETION USED IN NAMING
 * 
 * variables names that starts with "p" are considered proxies
 * 
 * example:
 * ```ts
 * const objName = {} // objName is the original object
 * const pobjName =   // pobjName is the proxied original object
 *     JsRuntime.objWithUnderscoreAsPrivate( objName );
 * ```
 * 
*/
const viewConventions = {}


describe( "underscore seen as private fields", () => {

    it( "objWithUnderscoreAsPrivate leaves empty objects untouched", () => {

        const emptyObj = {};
        const pemptyObj = JsRuntime.objWithUnderscoreAsPrivate( emptyObj );

        expect( Object.keys( emptyObj ) ).toEqual( Object.keys( pemptyObj ));

    })

    it( "objWithUnderscoreAsPrivate leaves objects without underscore properties untouched", () => {

        const emptyObj = {
            hello: "hello",
            number: 42,
            world: "world",
            someFunc: () => {}
        };
        const pemptyObj = JsRuntime.objWithUnderscoreAsPrivate( emptyObj );

        expect( Object.keys( emptyObj ) ).toEqual( Object.keys( pemptyObj ));

    })

    it( "objWithUnderscoreAsPrivate hides underscore properties", () => {

        const emptyObj = {
            hello: "hello",
            _number: 42,
            world: "world",
            _someFunc: () => {}
        };
        const pemptyObj = JsRuntime.objWithUnderscoreAsPrivate( emptyObj );

        expect( Object.keys( emptyObj ) ).not.toEqual( Object.keys( pemptyObj ));
        expect( Object.keys( emptyObj ).length - 2 ).toEqual( Object.keys( pemptyObj ).length );
    })

})