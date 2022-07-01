import PlutsTypeError from "..";

export default class PlutsMemoryStructError extends PlutsTypeError
{
    constructor( msg: string )
    {
        super( msg );
    }
}