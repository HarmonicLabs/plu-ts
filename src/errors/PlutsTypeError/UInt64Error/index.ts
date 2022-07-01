import PluTsTypeError from "..";

export default class UInt64Error extends PluTsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}