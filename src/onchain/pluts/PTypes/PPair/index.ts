import { PType } from "../../PType";
import { PDataRepresentable } from "../../PType/PDataRepresentable";
/*
Class static side 'typeof PPair' incorrectly extends base class static side 'typeof PDataRepresentable'.
  The types returned by 'fromData(...)' are incompatible between these types.
    Type 'Term<PPair<PData, PData>>' is not assignable to type 'Term<PDataRepresentable>'.
      Type 'PDataRepresentable' is missing the following properties from type 'PPair<PData, PData>': _a, _bts(2417)
Type instantiation is excessively deep and possibly infinite.
*/
// @ts-ignore
export class PPair<A extends PType, B extends PType > extends PDataRepresentable
{
    private _a: A
    private _b: B

    constructor( a: A = new PType as A, b: B = new PType as B )
    {
        super();

        this._a = a;
        this._b = b;
    }

}
