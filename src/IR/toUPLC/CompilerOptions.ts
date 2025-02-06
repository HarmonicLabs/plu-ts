import { isObject } from "@harmoniclabs/obj-utils";
import { defaultUplcVersion, UPLCVersion } from "@harmoniclabs/uplc";

export interface CompilerUplcOptimizations {
    /**
     * 
     **/
    groupApplications: boolean;
    /**
     **/
    inlineSingleUse: boolean;
    /**
     **/
    simplifyWrappedPartialFuncApps: boolean;
    /**
     * 
     **/
    removeForceDelay: boolean;
}

export const productionUplcOptimizations: CompilerUplcOptimizations = Object.freeze({
    groupApplications: true,
    inlineSingleUse: true,
    simplifyWrappedPartialFuncApps: true,
    removeForceDelay: true
});

export const debugUplcOptimizations: CompilerUplcOptimizations = Object.freeze({
    groupApplications: false,
    inlineSingleUse: false,
    simplifyWrappedPartialFuncApps: false,
    removeForceDelay: true
});

export const defaultUplcOptimizations: CompilerUplcOptimizations = productionUplcOptimizations;

export function isDebugUplcOptimizations(
    options: Partial<CompilerUplcOptimizations> = {}
): boolean
{
    return Object.keys( debugUplcOptimizations )
    .every((key: keyof CompilerUplcOptimizations) => {

        // keys to ignore
        if( key === "removeForceDelay" ) return true;

        return options[ key ] === debugUplcOptimizations[ key ]
    });
}

export function completeUplcOptimizations(
    options: Partial<CompilerUplcOptimizations>,
    complete: CompilerUplcOptimizations = defaultUplcOptimizations
): CompilerUplcOptimizations
{
    if( !isObject( options ) ) return { ...defaultUplcOptimizations };
    return {
        groupApplications: options.groupApplications ?? complete.groupApplications,
        inlineSingleUse: options.inlineSingleUse ?? complete.inlineSingleUse,
        simplifyWrappedPartialFuncApps: options.simplifyWrappedPartialFuncApps ?? complete.simplifyWrappedPartialFuncApps,
        removeForceDelay: options.removeForceDelay ?? complete.removeForceDelay
    };
}

export interface CompilerOptions {
    /**
     * uplc version (encoded in the script)
     */
    targetUplcVersion: UPLCVersion;
    /**
     * @todo TODO
     * 
     * @default true
     * 
     * set to `false` only for debugging purposes
     **/
    removeTraces: boolean;
    /**
     * @todo TODO
     * 
     * if `true` replaces all `IRHoisted` with `IRLetted`
     * 
     * handling letted terms is more expansive than hoisted terms
     * because hoisted (since closed terms) are blindly added as roots of the script
     * 
     * however this approach impacts the "script startup cost" considerably
     * esxpecially for scripts with different branches (eg. multi purpose scripts)
     * where some hoisted may never be used in some branches,
     * but still are added to the "initialization cost"
     * 
     * on the other hand, handling letted instead of hoisted may impact compliation time
     * 
     * for this reason it is best to set this option to `true` only for production
     **/
    delayHoists: boolean;
    /**
     * 
     **/
    uplcOptimizations: /* boolean |*/ Partial<CompilerUplcOptimizations>;
    /**
     * 
     **/
    addMarker: boolean;
}

export const extremeOptions: CompilerOptions = Object.freeze({
    targetUplcVersion: defaultUplcVersion,
    removeTraces: true,
    delayHoists: true,
    uplcOptimizations: productionUplcOptimizations,
    addMarker: true
});

export const productionOptions: CompilerOptions = Object.freeze({
    targetUplcVersion: defaultUplcVersion,
    removeTraces: true,
    delayHoists: true,
    uplcOptimizations: productionUplcOptimizations,
    addMarker: true
});

export const debugOptions: CompilerOptions = Object.freeze({
    targetUplcVersion: defaultUplcVersion,
    removeTraces: false,
    delayHoists: false,
    uplcOptimizations: debugUplcOptimizations,
    addMarker: false
});

export const defaultOptions: CompilerOptions = productionOptions;

export const defulatCompilerOptions = defaultOptions;

export function completeCompilerOptions(
    options: Partial<CompilerOptions>,
    complete: CompilerOptions = defaultOptions
): CompilerOptions
{
    let targetUplcVersion = options.targetUplcVersion instanceof UPLCVersion ? complete.targetUplcVersion : defaultUplcVersion;
    complete = {
        ...defaultOptions,
        ...complete
    };
    let uplcOptimizations = options.uplcOptimizations as CompilerUplcOptimizations;
    if( typeof options.uplcOptimizations === "boolean" )
    {
        if( options.uplcOptimizations )
        {
            uplcOptimizations = {
                ...productionUplcOptimizations,
                ...uplcOptimizations
            }
        }
        else
        {
            uplcOptimizations = {
                ...debugUplcOptimizations,
                ...uplcOptimizations,
            }
        }
    }
    // console.log( "uplcOptimizations", uplcOptimizations );
    // console.log( "completeUplcOptimizations( uplcOptimizations )",completeUplcOptimizations( uplcOptimizations ))
    return {
        targetUplcVersion,
        removeTraces: options.removeTraces ?? complete.removeTraces,
        delayHoists: options.delayHoists ?? complete.delayHoists,
        uplcOptimizations: completeUplcOptimizations( uplcOptimizations ),
        addMarker: options.addMarker ?? complete.addMarker
    };
}