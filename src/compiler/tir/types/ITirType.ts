export interface ITirType {
    /** @returns the AST name (human friendly) */
    toString(): string;
    /**
     * @returns the TIR name
     * 
     * if the type is generic, it returns only the name of the generic type
     **/
    toTirTypeKey(): string;
    /**
     * @returns the (unapplied) AST name
     * 
     * if the type is generic, it return only the name of the generic type
     * and not the type parameters
     * 
     * if the type is concrete, it returns the same as `toString()`
     */
    toAstName(): string;
}