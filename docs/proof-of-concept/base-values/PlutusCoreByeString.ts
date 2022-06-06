import IValidable from "../../src/types/interfaces/IValidable";

export default class PlutusCoreByteString
    implements  IValidable
{
    private _bs: string;

    constructor( bs: string )
    {
        if( !PlutusCoreByteString.isValid( bs ) ) throw Error("invalid plutus-core ByteString");

        this._bs = bs
    }

    public static isValid( bs: string ): boolean
    {
        return /^#([a-fA-F0-9][a-fA-F0-9])+$/.test( bs );
    }
    public isValid = PlutusCoreByteString.isValid;
}