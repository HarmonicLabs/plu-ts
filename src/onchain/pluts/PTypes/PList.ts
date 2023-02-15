import { PType } from "../PType";
import { PDataRepresentable } from "../PType/PDataRepresentable";

//@ts-ignoreType instantiation is excessively deep and possibly infinite
export class PList<A extends PType> extends PDataRepresentable
{
    private _elems: A[];

    constructor( elements: A[] = [] )
    {
        super();

        this._elems = elements
    }
}
