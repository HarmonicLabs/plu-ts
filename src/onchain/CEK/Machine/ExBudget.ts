import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString, { CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import BasePlutsError from "../../../errors/BasePlutsError";
import InvalidCborFormatError from "../../../errors/InvalidCborFormatError";
import Cloneable from "../../../types/interfaces/Cloneable";
import Integer, { CanBeUInteger, forceBigUInt, forceUInteger } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";
import ToJson from "../../../utils/ts/ToJson";

export interface IExBudget {
    mem: CanBeUInteger,
    cpu: CanBeUInteger
}

class ExBudget
    implements IExBudget, Cloneable<ExBudget>, ToCbor, ToJson
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
            _cpu = forceBigUInt( args_or_cpu.cpu );
            _mem = forceBigUInt( args_or_cpu.mem );
        }
        else
        {
            _cpu = forceBigUInt( args_or_cpu );
            if( mem === undefined )
            {
                throw new BasePlutsError(
                    'missing "mem" paramter while cosntructing "ExBudget" instance'
                );
            }
            _mem = forceBigUInt( mem );
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
                _cpu = _cpu + forceBigUInt( other.cpu );
                _mem = _mem + forceBigUInt( other.mem );
            }
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "sub", (other: Readonly<IExBudget>): void => {
                _cpu = _cpu - forceBigUInt( other.cpu );
                _mem = _mem - forceBigUInt( other.mem );
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
        const cpu = a.cpu - b.cpu;
        const mem = a.mem - b.mem;
        return new ExBudget( cpu, mem );
    }

    static get default(): ExBudget
    {
        return new ExBudget(
            10_000_000_000, // cpu
            14_000_000 // mem
        );
    }

    static get maxCborSize(): ExBudget
    {
        const max_uint64 = ( BigInt(1) << BigInt(64) ) - BigInt(1);
        return new ExBudget(
            max_uint64, // cpu
            max_uint64  // mem
        );
    }

    clone(): ExBudget
    {
        return new ExBudget( this.cpu, this.mem );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.mem ),
            new CborUInt( this.cpu )
        ]);
    }
    
    static fromCbor( cStr: CanBeCborString ): ExBudget
    {
        return ExBudget.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): ExBudget
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        ))
        throw new InvalidCborFormatError("ExBudget");

        return new ExBudget({
            mem: cObj.array[0].num,
            cpu: cObj.array[1].num,
        });
    }

    toJson()
    {
        return {
            cpu: this.cpu.toString(),
            mem: this.mem.toString()
        }
    }
}

export default ExBudget