import PlutsTypeError from "..";

export default class HexError extends PlutsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}