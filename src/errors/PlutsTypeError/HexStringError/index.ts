import { PlutsTypeError } from "..";

export class HexStringError extends PlutsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}