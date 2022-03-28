import PluTsTypeError from "../../PluTsTypeError";

export default class HexError extends PluTsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}