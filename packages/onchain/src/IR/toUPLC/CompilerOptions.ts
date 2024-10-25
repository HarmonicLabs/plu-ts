export interface CompilerOptions {
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
}

export const extremeOptions: CompilerOptions = Object.freeze({
    removeTraces: true,
    delayHoists: true
} as CompilerOptions);


export const productionOptions: CompilerOptions = Object.freeze({
    removeTraces: true,
    delayHoists: true
} as CompilerOptions);

export const debugOptions: CompilerOptions = Object.freeze({
    removeTraces: false,
    delayHoists: false
} as CompilerOptions);

export function completeCompilerOptions(
    options: Partial<CompilerOptions>,
    complete: CompilerOptions = productionOptions
): CompilerOptions
{
    complete = {
        ...productionOptions,
        ...complete
    };
    return {
        removeTraces: options.removeTraces ?? complete.removeTraces,
        delayHoists: options.delayHoists ?? complete.delayHoists
    } as CompilerOptions;
}