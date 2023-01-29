import { CanBeUInteger, forceBigUInt, forceUInteger } from "../../types/ints/Integer";
import ObjectUtils from "../../utils/ObjectUtils";
import CborArray from "../CborObj/CborArray";
import CborTag from "../CborObj/CborTag";
import CborUInt from "../CborObj/CborUInt";

export default class CborPositiveRational extends CborTag
{
    readonly num!: bigint;
    readonly den!: bigint;

    constructor( num: CanBeUInteger, den: CanBeUInteger )
    {
        const _num = forceBigUInt( num )
        const _den = forceBigUInt( den )

        super(
            30,
            new CborArray([
                new CborUInt( _num ),
                new CborUInt( _den )
            ])
        );

        ObjectUtils.defineReadOnlyProperty( this, "num", _num )
        ObjectUtils.defineReadOnlyProperty( this, "den", _den )
    }

}