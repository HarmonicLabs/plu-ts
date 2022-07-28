import PlutsTypeError from "..";

export default class HexStringError extends PlutsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}