import BasePluTsError from "../BasePlutsError";

export default class PlutsTypeError extends BasePluTsError
{
    constructor( msg: string )
    {
        super( msg );
    }
}