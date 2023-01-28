import { CanBeUInteger, forceBigUInt, forceUInteger } from "../../types/ints/Integer";
import ObjectUtils from "../../utils/ObjectUtils";
import CborArray from "../CborObj/CborArray";
import CborTag from "../CborObj/CborTag";
import CborUInt from "../CborObj/CborUInt";

export default class CborPositiveRational extends CborTag
{
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

        const jsNum = Number( _num ) / Number( _den );
        ObjectUtils.defineReadOnlyProperty( this, "toNumber", () => jsNum )
    }

    toNumber!: () => number;

}