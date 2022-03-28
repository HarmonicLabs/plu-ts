import BasePluTsError from "../BasePluTsError";

export default class PluTsTypeError extends BasePluTsError
{
    constructor( msg: string )
    {
        super( msg );
    }
}