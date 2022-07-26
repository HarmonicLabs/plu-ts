import IValidable from "../../src/types/interfaces/IValidable";

export default class PlutusCoreName
    implements IValidable
{
    private _name: string;

    constructor( name: string )
    {
        if( !PlutusCoreName.isValid(name) ) throw Error("not a valid plutus-core name");

        this._name = name;
    }

    public static isValid( name: string ): boolean
    {
        return /^[a-zA-Z][a-zA-Z0-9_']*$/.test( name );
    }
    public isValid = PlutusCoreName.isValid;
}