import BasePluTsError from "../BasePluTsError";

export default class PluTsEncodingError extends BasePluTsError
{
    constructor( msg: string )
    {
        super( msg );
    }
}