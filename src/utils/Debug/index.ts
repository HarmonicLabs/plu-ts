import BasePluTsError from "../../errors/BasePlutsError";
import AdditionalInfos from "./AdditionalInfo";
import DebugProxies from "./Proxies";

// update this manually for production
const _isDebugging: boolean = true;

export default class Debug
{
    static ignore = {
        isDeugging(): boolean { return this.isDeugging() },
        overrideDebugForNChecks( ...args: any[] ): void {},
        log( ...args: any[] ): void {},
        warn( ...args: any[] ): void {},
        err( ...args: any[] ): void {},
        assert( ...args: any[] ): void {},
        throw( ...args: any[] ): void {},
        Proxies: {
            withNoisySet<T extends object>( obj: T ): T { return obj }
        }
    }

    static isDeugging(): boolean
    {
        if( Debug._missingOverriddenStateValidity > 0 )
        {
            Debug._missingOverriddenStateValidity--;
            return Debug._overriddenDebugState;
        }
        return _isDebugging;
    }

    private static _overriddenDebugState: boolean = _isDebugging;
    private static _missingOverriddenStateValidity: number = 0;

    static overrideDebugForNChecks( nChecks: number , debugState : boolean = true ): void
    {
        Debug._missingOverriddenStateValidity = nChecks;
        Debug._overriddenDebugState = debugState;
    }

    // static class
    private constructor() {};

    static AddInfos = AdditionalInfos;

    static Proxies = DebugProxies;

    static log(...args: any[])
    {
        if( !Debug.isDeugging() ) return;

        console.log(...args);
    }

    static warn(...args: any[])
    {
        if( !Debug.isDeugging()) return;

        console.warn(...args);
    }

    static err(...args: any[])
    {
        if( !Debug.isDeugging() ) return;

        console.error(...args);
    }

    /**
     * assertion made only in the debugging process
     * 
     * @param condition 
     * @param errorMessage 
     * @param args 
     * @returns 
     */
    static assert<E extends BasePluTsError>( condition: boolean, errorMessage: string, ...args: any[])
    {
        if( !Debug.isDeugging() ) return;

        if( condition ) return;

        args.length > 0 && console.error(...args);
        throw (new BasePluTsError( errorMessage ) as E)
    }

    static throw<E extends BasePluTsError>( errorMessage: string, ...args: any[])
    {
        if( !Debug.isDeugging() ) return;

        args.length > 0 && console.error(...args);
        throw (new BasePluTsError( errorMessage ) as E)
    }
}