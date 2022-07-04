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
const viewConventions = {};

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

    saveYInX(): void
    {
        const _y = Number( this._y );
        if( !Number.isNaN( _y ) )
        {
            this.x = _y;
        }
    }
}

describe( "read only objects are read only", () => {

    it("can access (read) normally" ,() => {

        const dummy = JsRuntime.objAsReadonly( new DummyClass( 42, "hello" ) ) as DummyClass;

        expect( () => dummy.x ).not.toThrow();
        expect( () => dummy.getX() ).not.toThrow();

        // will do nothing but still accessible
        expect( () => dummy.saveYInX() ).not.toThrow();
    })

    it("setting valuses (writing) not allowed" ,() => {

        const dummy = JsRuntime.objAsReadonly( new DummyClass( 42, "hello" ) ) as DummyClass;
 
        expect( () => dummy.x = 42 ).toThrow(); // same value
        expect( () => dummy.x = 2 ).toThrow();
        expect( dummy.x ).toBe( 42 );

        expect( () => dummy.setY( Math.PI.toString() ) ).not.toThrow();
        expect( () => dummy.saveYInX() ).not.toThrow();
    })

    it("setting valuses via exposed interface is allowed" ,() => {

        const dummy = JsRuntime.objAsReadonly( new DummyClass( 42, "hello" ) ) as DummyClass;

        expect( dummy.getY() ).toBe( "hello" );
        expect( () => dummy.setY( Math.PI.toString() ) ).not.toThrow();
        expect( dummy.getY() ).toBe( Math.PI.toString() );

        expect( dummy.x ).toBe( 42 );
        expect( () => dummy.saveYInX() ).not.toThrow();
        expect( dummy.x ).toBe( Math.PI );
    })
})