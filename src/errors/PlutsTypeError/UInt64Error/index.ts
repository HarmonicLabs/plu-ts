import PluTsTypeError from "../../PluTsTypeError";

export default class UInt64Error extends PluTsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}