import BigIntUtils from "../../../../utils/BigIntUtils";
import ObjectUtils from "../../../../utils/ObjectUtils"

type PossibleNArgs = 1| 2 | 3 | 6;

type CostFuncNToArgs<N extends PossibleNArgs> = 
    N extends 1 ? [ x: bigint ] :
    N extends 2 ? [ x: bigint, y: bigint ] :
    N extends 3 ? [ x: bigint, y: bigint, z: bigint ] :
    N extends 6 ? [ a: bigint, b: bigint, c: bigint, d: bigint, e: bigint, f: bigint ] : 
    never;

export interface CostFunc<NArgs extends PossibleNArgs> {
    at: (...args: CostFuncNToArgs<NArgs>) => bigint
}

export interface ConstantCostFunc {
    const: bigint
}

export interface LinearCostFunc<N extends PossibleNArgs> extends CostFunc<N> {
    quote: bigint,
    slope: bigint
}

export interface Minimum {
    min: bigint
}

export class FixedCost implements CostFunc<1 | 2 | 3 | 6>, ConstantCostFunc
{
    readonly const!: bigint;
    constructor( constant: bigint )
    {
        ObjectUtils.defineReadOnlyProperty( this, "const", BigInt( constant ) );
    }
    at( ...xs: bigint[] ) { return this.const; }
}

class BaseLinear
{
    readonly quote!: bigint;
    readonly slope!: bigint;
    constructor( quote: bigint, slope: bigint )
    {
        ObjectUtils.defineReadOnlyProperty( this, "quote", BigInt( quote ) );
        ObjectUtils.defineReadOnlyProperty( this, "slope", BigInt( slope ) );
    }
}

export class Linear1 extends BaseLinear
    implements LinearCostFunc<1>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint ) { return this.quote + ( x * this.slope ) }
}

export class Linear2InX extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + ( x * this.slope ) }
}

export class Linear2InY extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + ( y * this.slope ) }
}

export class Linear2InBothAdd extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + ((x + y) * this.slope ) }
}

export class Linear2InBothSub extends BaseLinear
    implements LinearCostFunc<2>, Minimum
{
    readonly min!: bigint;
    constructor( quote: bigint, slope: bigint, min: bigint )
    {
        super( quote, slope );
        ObjectUtils.defineReadOnlyProperty( this, "min", BigInt( min ) );
    }
    at( x: bigint, y: bigint ) { return this.quote + ( BigIntUtils.max( this.min, (x - y) ) * this.slope ) }
}

export class Linear2InBothMult extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + ((x * y) * this.slope) }
}

export class Linear2InMin extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + (BigIntUtils.min(x, y) * this.slope) }
}

export class Linear2InMax extends BaseLinear
    implements LinearCostFunc<2>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint ) { return this.quote + (BigIntUtils.max(x, y) * this.slope) }
}

export class LinearOnEqualXY extends BaseLinear
    implements LinearCostFunc<2>, ConstantCostFunc
{
    readonly const!: bigint;
    constructor( quote: bigint, slope: bigint, constant: bigint )
    {
        super( quote, slope );
        ObjectUtils.defineReadOnlyProperty( this, "const",  BigInt( constant ));
    }
    at( x: bigint, y: bigint ) { return x === y ? this.quote + (x * this.slope) : this.const }
}

export class YGtEqOrConst<CostF extends CostFunc<2>>
    implements CostFunc<2>, ConstantCostFunc
{
    readonly const!: bigint;
    readonly f!: CostF
    constructor( constant: bigint, f: CostF )
    {
        ObjectUtils.defineReadOnlyProperty( this, "const", BigInt( constant ));
        ObjectUtils.defineReadOnlyProperty( this, "f", f);
    }
    at( x: bigint, y: bigint ) { return x > y ? this.const : this.f.at( x, y ) }
}

export class XGtEqOrConst<CostF extends CostFunc<2>>
    implements CostFunc<2>, ConstantCostFunc
{
    readonly const!: bigint;
    readonly f!: CostF
    constructor( constant: bigint, f: CostF )
    {
        ObjectUtils.defineReadOnlyProperty( this, "const", BigInt( constant ));
        ObjectUtils.defineReadOnlyProperty( this, "f", f );
    }
    at( x: bigint, y: bigint ) { return x < y ? this.const : this.f.at( x, y ) }
}

export class LinearInAll3 extends BaseLinear
    implements LinearCostFunc<3>
{
    constructor( quote: bigint, slope: bigint, constant: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint, z: bigint ) { return this.quote + ((x + y + z) * this.slope) }
}

export class Linear3InX extends BaseLinear
    implements LinearCostFunc<3>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint, z: bigint ) { return this.quote + ( x * this.slope ) }
}

export class Linear3InY extends BaseLinear
    implements LinearCostFunc<3>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint, z: bigint ) { return this.quote + ( y * this.slope ) }
}

export class Linear3InZ extends BaseLinear
    implements LinearCostFunc<3>
{
    constructor( quote: bigint, slope: bigint )
    {
        super( quote, slope );
    }
    at( x: bigint, y: bigint, z: bigint ) { return this.quote + ( z * this.slope ) }
}

export type OneArg
    = FixedCost
    | Linear1;

export type TwoArgs
    = FixedCost
    | Linear2InX
    | Linear2InY
    | Linear2InBothAdd
    | Linear2InBothSub
    | Linear2InBothMult
    | Linear2InMin
    | Linear2InMax
    | LinearOnEqualXY
    | YGtEqOrConst<CostFunc<2>>
    | XGtEqOrConst<CostFunc<2>>;

export type ThreeArgs
    = FixedCost
    | LinearInAll3
    | Linear3InX
    | Linear3InY
    | Linear3InZ;

export type SixArgs
    = FixedCost;

export type CostFunction
    = OneArg
    | TwoArgs
    | ThreeArgs
    | SixArgs;