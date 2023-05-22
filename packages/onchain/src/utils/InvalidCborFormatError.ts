export class InvalidCborFormatError extends Error
{
    constructor( str: string, restMsg: string = "" )
    {
        super(`Invalid CBOR format for "${str}"; ${restMsg}`)
    }
}