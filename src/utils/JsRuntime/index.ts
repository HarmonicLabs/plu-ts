import BasePlutsError from "../../errors/BasePlutsError";
import AdditionalInfo from "../Debug/AdditionalInfo";

type Constructable<ReturnT, ConstructorParams extends any[] = any[]> = { new(...args: ConstructorParams): ReturnT }
/**
 * @static
 */
export default class JsRuntime
{
    // static class
    private constructor () {}

    static assert<E extends BasePlutsError>( condition: boolean, errorMessage: string | E , addInfos?: AdditionalInfo ,...args: any[])
    {
        if( condition ) return;

        
        args.length > 0 && console.error(...args);
        console.error(addInfos);

        if( errorMessage instanceof BasePlutsError )
        {
            throw errorMessage
        };

        throw (new BasePlutsError( errorMessage ) as E)
    }

    static makeNotSupposedToHappenError<E extends BasePlutsError>( prefix: string ): E
    {
        return (new BasePlutsError( prefix + "\n\n\
        this is not supposed to happen, please open an issue, explaining how you got here: \
        https://github.com/HarmonicPool/plu-ts/issues") as E);
    }

    static objWithUnderscoreAsPrivate<T extends object>( tInstance: T ) {
        return new Proxy<T>( tInstance, {

            get: function ( instance, property, ...other )
            {
                if(typeof property === "symbol" || property.startsWith('_') )
                {
                    throw new BasePlutsError("attempt to access a private property");
                }
                const prop = Reflect.get( instance, property, ...other );

                if(typeof prop === "function")
                {
                    // if accessing a method
                    // return the method binded to the pure javascript version
                    // so that ignores the proxy
                    return prop.bind(instance);
                }

                return prop;
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
}

