import IValidable from "../../src/types/interfaces/IValidable";


export type True = true;
export type False = false;

type Boolean = True | False;

export default class PlutusCoreBoolean
{
    private _bool: boolean;
    constructor( bool: Boolean )
    {
        this._bool = bool
    }
};
