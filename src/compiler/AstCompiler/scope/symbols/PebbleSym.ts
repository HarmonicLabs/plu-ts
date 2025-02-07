import { isObject } from "@harmoniclabs/obj-utils";
import { TirCustomType, TirType } from "../../../../tir/TirType";
import { TirNativeType } from "../../../../tir/TirNativeType";

// can't call `Symbol`, so we don't confuse it with the built-in js `Symbol`
export type PebbleSym
    = PebbleTypeSym
    | PebbleValueSym
    ;

export function isPebbleSym( obj: any ): obj is PebbleSym
{
    return isObject( obj ) && (
        obj instanceof PebbleTypeSym
        || obj instanceof PebbleValueSym
    );
}

export interface IPebbleSym {
    readonly name: string;
}

export class PebbleTypeSym implements IPebbleTypeSym
{
    readonly name: string;
    private readonly concreteType: undefined;
    readonly isBuiltinType: boolean;
    readonly typeDef: TirCustomType | TirNativeType;

    constructor({
        name,
        isBuiltinType,
        typeDef
    }: IPebbleTypeSym)
    {
        this.name = name;
        this.concreteType = undefined;
        this.isBuiltinType = isBuiltinType;
        this.typeDef = typeDef;
    }
}

export interface IPebbleTypeSym extends IPebbleSym
{
    readonly isBuiltinType: boolean;
    readonly typeDef: TirCustomType | TirNativeType;
}

export class PebbleValueSym implements IPebbleValueSym
{
    readonly name: string;
    readonly concreteType: TirType;
    private readonly isBuiltinType: undefined;
    private readonly typeDef: undefined;

    constructor({
        name,
        concreteType
    }: IPebbleValueSym)
    {
        this.name = name;
        this.concreteType = concreteType;
        this.isBuiltinType = undefined;
        this.typeDef = undefined;
    }
}

export interface IPebbleValueSym extends IPebbleSym
{
    readonly concreteType: TirType;
}