import IValidable from "../../src/types/interfaces/IValidable";

export default class PlutusCoreVersion
    implements  IValidable
{
    private _version: string;

    constructor( version: string )
    {
        if( !PlutusCoreVersion.isValid( version ) ) throw Error("invalid plutus-core ByteString");

        this._version = version;
    }

    public static isValid( bs: string ): boolean
    {
        return /^[0-9]+(\.[0-9]+)*$/.test( bs );
    }
    public isValid = PlutusCoreVersion.isValid;
}