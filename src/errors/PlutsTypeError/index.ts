import BasePlutsError from "../BasePlutsError";

export default class PlutsTypeError extends BasePlutsError
{
    constructor( msg: string )
    {
        super( msg );
    }
}