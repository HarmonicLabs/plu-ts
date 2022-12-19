import BasePlutsError from "../../../errors/BasePlutsError";
import Cloneable from "../../../types/interfaces/Cloneable";
import Integer, { CanBeUInteger, forceUInteger } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";

export interface IExBudget {
    mem: CanBeUInteger,
    cpu: CanBeUInteger
}

class ExBudget
    implements IExBudget, Cloneable<ExBudget>
{
    readonly cpu!: bigint;
    readonly mem!: bigint;

    constructor( args: IExBudget)
    constructor( cpu: CanBeUInteger, mem: CanBeUInteger )
    constructor( args_or_cpu: IExBudget | CanBeUInteger, mem?: CanBeUInteger | undefined )
    {
        let _cpu: bigint;
        let _mem: bigint;

        if( typeof args_or_cpu === "object" && !( args_or_cpu instanceof Integer ) )
        {
            _cpu = forceUInteger( args_or_cpu.cpu ).asBigInt;
            _mem = forceUInteger( args_or_cpu.mem ).asBigInt;
        }
        else
        {
            _cpu = forceUInteger( args_or_cpu ).asBigInt;
            if( mem === undefined )
            {
                throw new BasePlutsError(
                    'missing "mem" paramter while cosntructing "ExBudget" instance'
                );
            }
            _mem = forceUInteger( mem ).asBigInt;
        }

        ObjectUtils.definePropertyIfNotPresent(
            this,
            "cpu",
            {
                get: () => _cpu,
                set: ( ..._whatever: any[] ) => {},
                enumerable: true,
                configurable: false 
            }
        );
        ObjectUtils.definePropertyIfNotPresent(
            this,
            "mem",
            {
                get: () => _mem,
                set: ( ..._whatever: any[] ) => {},
                enumerable: true,
                configurable: false 
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "add", (other: Readonly<IExBudget>): void => {
                _cpu = _cpu + forceUInteger( other.cpu ).asBigInt;
                _mem = _mem + forceUInteger( other.mem ).asBigInt;
            }
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "sub", (other: Readonly<IExBudget>): void => {
                _cpu = _cpu - forceUInteger( other.cpu ).asBigInt;
                _mem = _mem - forceUInteger( other.mem ).asBigInt;
            }
        );

    }

    readonly add!: ( other: Readonly<IExBudget> ) => void
    readonly sub!: ( other: Readonly<IExBudget> ) => void

    static add( a: ExBudget, b: ExBudget ): ExBudget
    {
        return new ExBudget( a.cpu + b.cpu, a.mem + b.mem );
    }

    static sub( a: ExBudget, b: ExBudget ): ExBudget
    {
        return new ExBudget( a.cpu - b.cpu, a.mem - b.mem );
    }

    static readonly default: ExBudget;

    clone(): ExBudget
    {
        return new ExBudget( this.cpu, this.mem );
    }
}

ObjectUtils.defineReadOnlyProperty(
    ExBudget,
    "default",
    new ExBudget(
        10_000_000_000, // cpu
        14_000_000 // mem
    )
);

export default ExBudget