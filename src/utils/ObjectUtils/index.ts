
export interface IObjectUtils
{
    isNotArray:     () => boolean
    isObject:       () => boolean
    hasUniqueKey:   ( key?: string ) => boolean
    hasNKeys:       ( n: number ) => boolean
    containsKeys:   ( ...keys : string[] ) => boolean
}

export default class ObjectUtils
{
    private constructor () {}

    static isNotArray( obj: object ): boolean
    {
        return !Array.isArray( obj );
    }

    static isObject( obj: any ): boolean
    {
        return (
            typeof obj === "object" &&
            ObjectUtils.isNotArray( obj ) &&
            obj !== null &&
            obj !== undefined // useless since "typeof" would have returned "undefined", but better safe than sorry :P
        )
    }

    static hasUniqueKey( obj: object, key: (string | undefined) = undefined ): boolean
    {
        const keys = Object.keys( obj );
        return (
            keys.length === 1 &&
            ( typeof key !== "undefined" ? keys[0] === key : true )
        );
    }

    static hasNkeys( obj: object, n: number): boolean
    {
        return (
            ObjectUtils.isObject( obj ) && 
            Object.keys( obj ).length === n
        );
    }

    static containsKeys( obj: object, ...keys : string[] ): boolean
    {
        const oKeys = Object.keys( obj );

        for( let i = 0; i < keys.length; i++ )
        {
            if( !oKeys.includes( keys[i] ) ) return false;
        }

        return true
    }

    static has_n_determined_keys<Keys extends string[]>( obj: object, n : number, ...keys: Keys ): boolean
    {
        return (
            ObjectUtils.hasNkeys( obj , n )             &&
            keys.length === n                           &&
            ObjectUtils.containsKeys( obj, ...keys )  
        );
    }

    static hasOwn: <obj, K extends (string | number | symbol)>( obj: obj, propName: K ) => obj is (obj & Record<K, any>) = 
        (
            (Object as any).hasOwn ?? 
            Object.prototype.hasOwnProperty.call
        ) ?? ObjectUtils.containsKeys;

    static isSerializable( obj: object ): boolean
    {
        const keys = Object.keys( obj );

        for( let i = 0; i < keys.length; i++)
        {
            const value = ( obj as any )[keys[i]];

            if(
                typeof value === "number" ||
                typeof value === "bigint" ||
                typeof value === "boolean" ||
                typeof value === "string" ||
                typeof value === "undefined"
            ) continue; // this single value is true, don't know the others
            else
            {
                if( Array.isArray( value ) )
                {
                    for( let i = 0; i < value.length; i++ )
                    {
                        // all array elements must be serilalizable to
                        // equivalent to AND all elments
                        if( !ObjectUtils.isSerializable( value[i] ) ) return false;
                    }
                }
                else if ( typeof value === "object" )
                {
                    if( !ObjectUtils.isSerializable( value ) ) continue; // this single value is true, don't know the others
                    else return false;
                }
                else if( typeof value === "function" ) return false;
            }
        }

        return true;
    }

    static deepEqual( a: any , b: any ): boolean
    {
        if( typeof a !== typeof b )
        {
            return false;
        }

        /*
        covers:
        - nuber
        - strings
        - boolean
        - functions only if are the same object
        ( unfortunately, proving deep function equality is not possible (yet) )
        */
        if( a === b )
        {
            return true;
        }
    
        if( Array.isArray(a) )
        {
            if(Array.isArray(b))
            {
                if( a.length !== b.length ) return false;
    
                for(let i = 0 ; i < a.length; i++ )
                {
                    if(
                        !ObjectUtils.deepEqual( a[i], b[i] )
                    )
                    {
                        return false;
                    }
                }
    
                return true;
            }
            else // a and b are not both arrays
            {
                return false;
            }
        }
        else if(Array.isArray(b)) return false; // a is an array indeed
    
        // type equality checked before, no need to re-check
        if( typeof a === "object" )
        {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
    
            if( aKeys.length !== aKeys.length )
            {
                return false;
            }
    
            // {} === {} -> true
            if( aKeys.length === 0 && bKeys.length === 0 )
            {
                return true;
            }
    
            for( let i = 0 ; i < aKeys.length; i++ )
            {
                let foundThis_a = false;
    
                for(let j = 0; j < bKeys.length; j++)
                {
                    if( aKeys[i] === bKeys[j] )
                    {
                        foundThis_a = true;
                        break;
                    }
                }
    
                if(foundThis_a)
                {
                    if (ObjectUtils.deepEqual( a[aKeys[i]], b[aKeys[i]] ))
                    {
                        if( i === (aKeys.length - 1) )
                        {
                            return true;
                        }
                        continue;
                    }
                    else return false;
                }
                else
                {
                    return false;
                }
            }
        }
        
        return false;
    }

    static jsonClone<T extends any>( obj: T ): T
    {
        return JSON.parse( JSON.stringify( obj ) );
    }
    
    static deepClone<T extends any = any>( obj: T ): T
    {
        let clone : any;

        //@ts-ignore
        if( typeof obj === "function" ) return cloneFunc( obj ); 

        if( typeof obj === "object")
        {
            if( Array.isArray( obj ) )
            {
                clone = []

                for( let i = 0; i < obj.length; i++)
                {
                    clone[i] = ObjectUtils.deepClone(obj[i]);
                }

                return clone;
            }

            const objKeys = Object.keys( obj as object );

            for( let i = 0 ; i < objKeys.length; i++ )
            {
                clone[ objKeys[i] ] = ObjectUtils.deepClone( (obj as any)[ objKeys[i] ] );
            }

            return clone;
        }

        // number
        // string
        // boolean
        return obj;
    }

    static freezeAll<T>( something: T ): Readonly<T>
    {
        if( typeof something === "object" && something !== null )
        {
            const ks = Object.keys( something );
            for( let i = 0; i < ks.length; i++ )
            {
                ObjectUtils.freezeAll( (something as any)[ ks[i] ] );
            }
        }

        return Object.freeze( something );
    }

    static writableProperty     = 0b001;
    static enumerableProperty   = 0b010;
    static configurableProperty = 0b100;

    /*
    https://stackoverflow.com/questions/52204566/typescript-add-dynamically-named-property-to-return-type

    declare function addKeyValue2<T extends {}, K extends keyof any, V>(obj: T, key: K, value: V):
        { [P in keyof (T & Record<K, any>)]: P extends K ? V : P extends keyof T ? T[P] : never }
    */
    /**
     * 
     * @param obj {object} to define the property on
     * @param name {PropertyKey} name of the property
     * @param value {any} value of the property
     * @param accessLevel writable / enumerable / configurable
     * 
     * enumerable   = 0b010, if ```false``` is not showed
     * configurable = 0b100, if ```false``` cannot be deleted or changed
     * 
     * 0 -> none // hidden object-specific descriptor
     * 
     * 1 -> writable only // hidden, modifiable, non deletable
     * 
     * 2 -> enumerable only // showed object-specific descriptor
     * 
     * 3 -> writable AND enumerable // non deletable
     * 
     * 4 -> configurable only // hidden object-specific deleteable descriptor
     * 
     * 5 -> configurable AND writable // hidden, modifiable, deletable
     * 
     * 6 -> configurable AND enumerable // showed, non modifiable, deletable
     * 
     * 7 -> all // showed, modifiable, deletable
     * 
     */
    static defineProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT, accessLevel : 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = 0 )
        : ObjT & Record< PropKey, ValT >
    {
        return Object.defineProperty(
            obj, name, 
            {
                value: value,
                writable:       ( accessLevel & ObjectUtils.writableProperty )      == ObjectUtils.writableProperty,
                enumerable:     ( accessLevel & ObjectUtils.enumerableProperty )    == ObjectUtils.enumerableProperty,
                configurable:   ( accessLevel & ObjectUtils.configurableProperty )  == ObjectUtils.configurableProperty,
            }
        ) as ObjT & Record< PropKey, ValT >;
    }

    static definePropertyIfNotPresent<ObjT extends object, PropKey extends keyof any , ValT >
    ( 
        obj: ObjT,
        name: PropKey,
        descriptor: Partial<{
            get: () => ValT,
            set: ( v: ValT ) => void,
            value: ValT,
            writable: boolean
            enumerable: boolean
            configurable: boolean
        }>
    )
        : ObjT & Record< PropKey, ValT >
    {
        if( ObjectUtils.hasOwn( obj, name ) ) return obj as any;

        return Object.defineProperty( obj, name, descriptor ) as any;
    }

    static defineReadOnlyHiddenProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT ): ObjT
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 0
        )
    }

    static defineWritableHiddenProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 1
        )
    }

    /**
     * 2 -> enumerable only 
     * 
     * property is showed and can be accessed trough indexing
     * 
     * cannot be modified
     * 
     * cannot be deleted
     */
    static defineReadOnlyProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT): ObjT & Record<PropKey, ValT>
    {
        if(
            ObjectUtils.hasOwn( obj, name ) &&  // if the object has already a property with the same name
            (!( Object.getOwnPropertyDescriptor( obj, name )?.writable )) // and it cannot be overridden
        ) return obj as any;                           // return that object;

        return ObjectUtils.defineProperty(
            obj, name, value, 2
        )
    }

    static defineNonDeletableNormalProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        if(
            ObjectUtils.hasOwn( obj, name ) &&  // if the object has already a property with the same name
            (!( Object.getOwnPropertyDescriptor( obj, name )?.writable )) // and it cannot be overridden
        ) return obj;                           // return that object;
        
        return ObjectUtils.defineProperty(
            obj, name, value, 3
        )
    }

    static defineDeletableDescriptor<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 4
        )
    }

    static defineHiddenNormalProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 5
        )
    }

    static defineFixedDeletableProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 6
        )
    }

    static defineNormalProperty<ObjT extends object, PropKey extends keyof any , ValT >
        ( obj: ObjT, name: PropKey, value: ValT)
    {
        return ObjectUtils.defineProperty(
            obj, name, value, 7
        )
    }
}

function cloneFunc( func: Function ): Function
{
    let cloneObj = func;

    //@ts-ignore
    if(func.__isClone) {
        //@ts-ignore
        cloneObj = func.__clonedFrom;
    }
    
    //@ts-ignore
    let temp = function() { return cloneObj.apply(this, arguments); };

    for(let key in func) {
        //@ts-ignore
        temp[key] = func[key];
    }

    //@ts-ignore
    temp.__isClone = true;
    //@ts-ignore
    temp.__clonedFrom = cloneObj;

    return temp;
};