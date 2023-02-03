import { BasePlutsError } from "../BasePlutsError";

export class PlutsTypeError extends BasePlutsError
{
    constructor( msg: string )
    {
        super( msg );
    }
}