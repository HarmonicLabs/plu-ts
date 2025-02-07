import { isObject } from "@harmoniclabs/obj-utils";

export type PebbleTypeSym
    = 
    ;

export type PebbleValueSym
    =
    ;

// can't call `Symbol`, so we don't confuse it with the built-in js `Symbol`
export type PebbleSym
    = PebbleTypeSym
    | PebbleValueSym
    ;

export function isPebbleSym( obj: any ): obj is PebbleSym
{
    return isObject( obj ) && (
        isPebbleTypeSym( obj ) ||
        isPebbleValueSym( obj )
    );
}

export function isPebbleTypeSym( obj: any ): obj is PebbleTypeSym
{
    return isObject( obj ) && (
    );
}

export function isPebbleValueSym( obj: any ): obj is PebbleValueSym
{
    return isObject( obj ) && (
    );
}

export interface IPebbleSym {
    readonly name: string;
}

export interface IPebbleTypeSym extends IPebbleSym {
    // preserve overall PebbleSym shape
    // for js runtime engine optimizations
    readonly type: undefined; 
    // actual type sym infos
    readonly isBuiltinType: boolean;
    readonly typeDef: ;
}

export interface IPebbleValueSym extends IPebbleSym {
    // actual value sym infos
    readonly type: ;
    // preserve overall PebbleSym shape
    // for js runtime engine optimizations
    readonly isBuiltinType: undefined;
    readonly typeDef: undefined;
}