import { Type, TermType } from "../Term/Type/base";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PUnit extends PDataRepresentable
{
    private _unit: undefined

    constructor()
    {
        super();
        this._unit = undefined;
    }

    static override get termType(): TermType { return Type.Unit };
}