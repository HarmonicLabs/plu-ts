import { BasePlutsError } from "../../errors/BasePlutsError";
import AdditionalInfo from "../Debug/AdditionalInfo";

type Constructable<ReturnT, ConstructorParams extends any[] = any[]> = { new(...args: ConstructorParams): ReturnT }

/**
 * for tests only
 */
let _JsRuntime_silent : boolean = false;

/**
 * @static
 */
export default class JsRuntime
{
    /**
     * for tests only
     */
    static setSilent(): void
    {
        _JsRuntime_silent = true;
    }

    /**
     * for tests only
     */
    static unsetSilent(): void
    {
        _JsRuntime_silent = false;
    }
    // static class
    private constructor () {}

    static readonly pleaseOpenAnIssue: Readonly<string> = 
        "please open an issue explaining how you got here: https://github.com/HarmonicPool/plu-ts/issues";

    static assert<E extends BasePlutsError>( condition: boolean, errorMessage: string | E , addInfos?: AdditionalInfo ,...args: any[])
    {
        if( condition ) return;
        
        !_JsRuntime_silent && args.length > 0 && console.error(...args);
        !_JsRuntime_silent && addInfos && console.error(addInfos);

        if( errorMessage instanceof BasePlutsError )
        {
            throw errorMessage
        };

        throw (new BasePlutsError( errorMessage ) as E)
    }

    static throw<E extends BasePlutsError>( errorMessage: string | E , addInfos?: AdditionalInfo ,...args: any[])
    {
        !_JsRuntime_silent && args.length > 0 && console.error(...args);
        !_JsRuntime_silent && addInfos && console.error(addInfos);

        if( errorMessage instanceof BasePlutsError )
        {
            throw errorMessage
        };

        throw (new BasePlutsError( errorMessage ) as E)
    }

    static makeNotSupposedToHappenError( prefix: string )
    {
        return new BasePlutsError( prefix + "\n\n\
        this is not supposed to happen, please open an issue explaining how you got here: \
        https://github.com/HarmonicLabs/plu-ts/issues");
    }

    static objWithUnderscoreAsPrivate<T extends object>( tInstance: T ) {
        return new Proxy<T>( tInstance, {

            get: function ( instance, property, ...other )
            {
                if(typeof property === "symbol" || property.startsWith('_') )
                {
                    throw new BasePlutsError("attempt to access a private property");
                }
                const propValue = Reflect.get( instance, property, ...other );

                if(typeof propValue === "function")
                {
                    // if accessing a method
                    // return the method binded to the pure javascript version
                    // so that ignores the proxy
                    return propValue.bind(instance);
                }

                return propValue;
            },

            set: function ( instance, property, value, ...other )
            {
                if(typeof property === "symbol" || property.startsWith('_') )
                {
                    throw new BasePlutsError("attempt to set a private property");
                }
                return Reflect.set( instance, property, value , ...other );
            },

            has: function( instance, property, ...other )
            {
                if(typeof property === "symbol" || property.startsWith('_') )
                {
                    return false;
                }
                return Reflect.has( instance, property, ...other );
            },

            ownKeys: function (target) {
                return Reflect.ownKeys(target)
                    // shows only strings, and only those that do not start with an underscore
                    .filter( k => typeof k === "string" && !k.startsWith('_') );
            }
        })
    }

    static withUnderscoreAsPrivate
        <T extends Constructable<any>, ConstructorParams extends any[] = any[]>( 
            classConstructor: T
        ) : T
    {

        return new Proxy( classConstructor, {

            construct: function( originalConstructor : Constructable<T> , args: ConstructorParams ): T
            {
                return JsRuntime.objWithUnderscoreAsPrivate(
                    Reflect.construct( originalConstructor, args )
                );
            }

        });

    }

    static objAsReadonly<T extends object>( tInstance: T ) : Readonly<T> 
    {
        return new Proxy<T>( tInstance, {

            get: function ( instance, property, ...other )
            {
                const propValue = Reflect.get( instance, property, ...other );

                if(typeof propValue === "function")
                {
                    // if accessing a method it should be able to modify the object if needed
                    // return the method binded to the pure javascript version
                    // so that ignores the proxy
                    return propValue.bind(instance);
                }

                if( typeof propValue === "object" )
                {
                    // proxies the sets of the object too,
                    // note this is happens for arrays also
                    return JsRuntime.objAsReadonly( propValue as object );
                }

                return propValue;
            },

            set: function ( _instance, _property, _value, ..._other )
            {
                throw new BasePlutsError("object marked as readonly, assigning values is not allowed");
            }

        })
    }
}

