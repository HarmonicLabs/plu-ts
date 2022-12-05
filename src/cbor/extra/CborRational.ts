import { CanBeUInteger, forceUInteger } from "../../types/ints/Integer";
import CborArray from "../CborObj/CborArray";
import CborTag from "../CborObj/CborTag";
import CborUInt from "../CborObj/CborUInt";

export default class CborPositiveRational extends CborTag
{
    constructor( num: CanBeUInteger, den: CanBeUInteger )
    {
        super(
            30,
            new CborArray([
                new CborUInt(
                    forceUInteger( num ).asBigInt
                ),
                new CborUInt(
                    forceUInteger( den ).asBigInt
                )
            ])
        );
    }

}