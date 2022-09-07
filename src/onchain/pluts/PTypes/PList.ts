import PType from "../PType";
import PData from "./PData";


export default class PList<A extends PType> extends PType
{
    private _elems: A[];

    constructor( elements: A[] = [] )
    {
        super();

        this._elems = elements
    }
}