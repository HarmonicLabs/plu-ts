import BasePlutsError from "../../errors/BasePlutsError";
import AdditionalInfo from "../Debug/AdditionalInfo";


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
                return Reflect.get( instance, property, ...other );
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

    static extendClassWithUnderscoreAsPrivate<T extends object, Constructor extends (...args: any[]) => T>( classConstructor: Constructor ) 
    {
        const ExtendedWithPrivates = function( ...args: any[] ) {};
        ExtendedWithPrivates.prototype = Object.create( classConstructor.prototype );

        ExtendedWithPrivates.prototype.constructor = new Proxy( ExtendedWithPrivates, {

            construct: function(target, args) {
                
                const obj = Object.create( ExtendedWithPrivates.prototype );
                
                this.apply(target, obj, args);
                
                return JsRuntime.objWithUnderscoreAsPrivate( obj );
            },

            apply: function( _target, that, args) {
                classConstructor.apply(that, args);
                ExtendedWithPrivates.apply(that, args);
            }

        });

        return ExtendedWithPrivates.prototype.constructor;
    }
}

function extend(sup, base) {
    base.prototype = Object.create(sup.prototype);
    base.prototype.constructor = new Proxy(base, {
      construct: function(target, args) {
        const obj = Object.create(base.prototype);
        this.apply(target, obj, args);
        return obj;
      },
      apply: function(target, that, args) {
        sup.apply(that, args);
        base.apply(that, args);
      }
    });
    return base.prototype.constructor;
  }