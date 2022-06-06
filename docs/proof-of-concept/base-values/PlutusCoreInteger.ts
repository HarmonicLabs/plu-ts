import IValidable from "../../src/types/interfaces/IValidable";


export default class PlutusCoreInteger
    implements IValidable
{
    private _strNum: string;

    constructor( strNum: string )
    {
        if( !PlutusCoreInteger.isValid(strNum) ) throw Error("not a valid plutus-core integer");

        this._strNum = strNum;
    }

    public static isValid( strNum: string ): boolean
    {
        return /^[+-]?[0-9]+$/.test( strNum );
    }
    public isValid = PlutusCoreInteger.isValid;
}