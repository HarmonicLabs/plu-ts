import BasePlutsError from "./BasePlutsError";

export default class InvalidCborFormatError extends BasePlutsError
{
    constructor( expectedClass: string, restMsg?: string )
    {
        super( "invalid Cbor format for \"" + expectedClass + "\"; " + ( restMsg === undefined ? "" : restMsg ) )
    }
}