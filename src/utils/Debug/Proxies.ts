import Debug from ".";

export default class DebugProxies
{
    private constructor () {}

    static withNoisySet<T extends object>( obj: T ): T
    {
        return new Proxy( obj, {
            set( instance, key, value, _receiver )
            {
                Debug.log( 
                    "operating on object", instance, 
                    `\nchanging property: ${String( key )}`,
                    `\nfrom previous value: ${Reflect.get( instance, key, _receiver )}`,
                    `\nto new value: ${value}`
                );
                return Reflect.set( instance, key, value, _receiver )
            }
        })
    }
}