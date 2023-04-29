import JsRuntime from "..";
import Debug from "../../Debug";

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

describe( "underscore seen as private fields on plain objects", () => {

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


        expect( emptyObj ).not.toBe( pemptyObj );
        expect( Object.keys( emptyObj ) ).not.toEqual( Object.keys( pemptyObj ));
        expect( Object.keys( emptyObj ).length - 2 ).toEqual( Object.keys( pemptyObj ).length );
    })

    it( "objWithUnderscoreAsPrivate throws when accessing underscore properties", () => {

        const obj = {
            hello: "hello",
            _number: 42,
            world: "world",
            _someFunc: () => {}
        };
        const pobj = JsRuntime.objWithUnderscoreAsPrivate( obj );


        expect( () => pobj._number ).toThrow()
        expect( () => obj._number ).not.toThrow()
        expect( () => pobj._someFunc ).toThrow()
        expect( () => obj._someFunc ).not.toThrow()
    })

    it( "objWithUnderscoreAsPrivate can access non-underscore properties", () => {

        const obj = {
            hello: "hello",
            _number: 42,
            world: "world",
            _someFunc: () => {}
        };
        const pobj = JsRuntime.objWithUnderscoreAsPrivate( obj );


        expect( () => pobj.hello ).not.toThrow()
        expect( () => obj.hello ).not.toThrow()
        expect( () => pobj.world ).not.toThrow()
        expect( () => obj.world ).not.toThrow()
    })

})

describe( "underscores seen as private on class instances", () => {

    class DummyClass 
    {
        x: number;
        _y: string;
        constructor( x: number , y: string )
        {
            this.x = x;
            this._y = y;
        }

        getY(): string
        {
            return this._y;
        }

        setY( val: string ): void
        {
            this._y = val;
        }

        getX(): number
        {
            return this.x;
        }

        _somethingMalefic(): void
        {
            this.x = Number( this._y ) // NaN
        }

        saveYInX(): void
        {
            const _y = Number( this._y );
            if( !Number.isNaN( _y ) )
            {
                this._somethingMalefic();
            }
        }
    }
    
    const PrivateDummyClass = 
        JsRuntime.withUnderscoreAsPrivate( DummyClass );


    it( "can access privates through exposed interface" , () => {

        const withPrivate = new PrivateDummyClass( 42, "hidden" );
        
        expect( () => withPrivate.x ).not.toThrow();
        expect( () => withPrivate._y ).toThrow();
        expect( () => withPrivate.getY() ).not.toThrow();

        expect( withPrivate.getY() ).toBe( "hidden" );
        
        // Debug.log("_y before setY:", withPrivate.getY() );
        withPrivate.setY( "not original value");
        // Debug.log("_y after setY:", withPrivate.getY() );

        expect( withPrivate.getY() ).not.toBe( "hidden" );
        expect( withPrivate.getY() ).toBe( "not original value" );
    })
    
    it( "modifying public fields doesn't affects methods execution" , () => {

        const withPrivate = new PrivateDummyClass( 42, "hidden" );

        expect( withPrivate.x ).toBe( 42 );
        expect( withPrivate.getX() ).toBe( withPrivate.x );

        expect( () => { withPrivate.x = 69 } ).not.toThrow();

        expect( withPrivate.x ).toBe( 69 );
        expect( withPrivate.getX() ).toBe( withPrivate.x );

    })

    it( "still can't call private methods", () => {
        const withPrivate = new PrivateDummyClass( 42, "hidden" );

        expect( () => withPrivate._somethingMalefic() ).toThrow();
    })

    it( "can access private methods torugh exposed interface", () => {
        
        const withPrivate = new PrivateDummyClass( 42, "hidden" );

        expect( () => withPrivate.saveYInX() ).not.toThrow();
        expect( withPrivate.x ).toBe( 42 );

        withPrivate.setY( Math.PI.toString() )
        expect( () => withPrivate.saveYInX() ).not.toThrow();
        expect( withPrivate.x ).toBe( Math.PI );

    })
})