import { isObject } from "@harmoniclabs/obj-utils";
import { TirConcreteType } from "../../../tir/types/TirConcreteType";

// can't call `Symbol`, so we don't confuse it with the built-in js `Symbol`
export type PebbleSym
    = PebbleConcreteTypeSym
    | PebbleValueSym
    | PebbleGenericSym
    | PebbleConcreteFunctionSym
    | PebbleGenericFunctionSym
    ;

export function isPebbleSym( obj: any ): obj is PebbleSym
{
    return isObject( obj ) && (
        obj instanceof PebbleConcreteTypeSym
        || obj instanceof PebbleValueSym
        || obj instanceof PebbleGenericSym
        || obj instanceof PebbleConcreteFunctionSym
        || obj instanceof PebbleGenericFunctionSym
    );
}

export interface IPebbleSym {
    readonly name: string;
}

export interface IPebbleValueSym extends IPebbleSym {
    readonly concreteType: TirConcreteType | undefined;
}
export class PebbleValueSym implements IPebbleValueSym
{
    readonly name: string;
    readonly concreteType: TirConcreteType | undefined;

    constructor({
        name,
        concreteType
    }: IPebbleValueSym)
    {
        this.name = name;
        this.concreteType = concreteType;
    }
}

export type PebbleAnyTypeSym
    = PebbleConcreteTypeSym
    | PebbleGenericSym
    | PebbleConcreteFunctionSym
    | PebbleGenericFunctionSym
    ;
export interface IPebbleConcreteTypeSym extends IPebbleSym {
    readonly concreteType: TirConcreteType;
}

export class PebbleConcreteTypeSym
    implements IPebbleConcreteTypeSym
{
    readonly name: string;
    readonly concreteType: TirConcreteType;

    constructor({
        name,
        concreteType,
        
    }: IPebbleConcreteTypeSym)
    {
        this.name = name;
        this.concreteType = concreteType;
    }
}

export interface IPebbleGenericSym extends IPebbleSym {
    readonly nTypeParameters: number;
    getConcreteType: ( ...typeArgs: TirConcreteType[] ) => (TirConcreteType | undefined);
}

export class PebbleGenericSym
    implements IPebbleGenericSym
{
    readonly name: string;
    readonly nTypeParameters: number;
    getConcreteType: ( ...typeArgs: TirConcreteType[] ) => (TirConcreteType | undefined);

    constructor({
        name,
        nTypeParameters,
        getConcreteType
    }: IPebbleGenericSym)
    {
        this.name = name;
        this.nTypeParameters = nTypeParameters;
        this.getConcreteType = getConcreteType;
    }
}

export interface IPebbleFunctionSym extends IPebbleSym {
    readonly name: string;
    readonly oveloads: IPebbleConcreteFuncOverload[];
}

export interface IPebbleConcreteFuncOverload {
    readonly params: TirConcreteType[];
    readonly returnType: TirConcreteType;
}

export class PebbleConcreteFunctionSym
    implements IPebbleFunctionSym
{
    readonly name: string;
    readonly oveloads: PebbleConcreteFuncOverload[];

    constructor({
        name,
        oveloads
    }: IPebbleFunctionSym)
    {
        this.name = name;
        this.oveloads = oveloads.map( ov => ov instanceof PebbleConcreteFuncOverload ? ov : new PebbleConcreteFuncOverload( ov ) );
    }
}

export class PebbleConcreteFuncOverload
    implements IPebbleConcreteFuncOverload
{
    readonly params: TirConcreteType[];
    readonly returnType: TirConcreteType;

    constructor({
        params,
        returnType
    }: IPebbleConcreteFuncOverload)
    {
        this.params = params;
        this.returnType = returnType;
    }
}

export interface IPebbleGenericFunctionSym extends IPebbleSym {
    readonly name: string;
    readonly typeParams: symbol[];
    readonly params: (TirConcreteType | symbol)[];
    readonly returnType: TirConcreteType | symbol;
}

export class PebbleGenericFunctionSym
    implements IPebbleGenericFunctionSym
{
    readonly name: string;
    readonly typeParams: symbol[];
    readonly params: (TirConcreteType | symbol)[];
    readonly returnType: TirConcreteType | symbol;

    constructor({
        name,
        typeParams,
        params,
        returnType
    }: IPebbleGenericFunctionSym)
    {
        this.name = name;
        this.typeParams = typeParams;
        this.params = params;
        this.returnType = returnType;
    }
}