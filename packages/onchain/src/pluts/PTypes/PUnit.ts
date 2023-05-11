import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PUnit extends PDataRepresentable
{
    private _unit: undefined

    constructor()
    {
        super();
        this._unit = undefined;
    }

    clone(): PUnit
    {
        return new PUnit;
    }
}