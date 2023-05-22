import { PType } from "../../PType"
import { Cloneable, isCloneable } from "../../../utils/Cloneable";

export class PLam<A extends PType, B extends PType > extends PType
    implements Cloneable<PLam<A,B>>
{
    // phantom
    private _input: A
    private _output: B

    constructor( input: A = new PType as A, output: B = new PType as B )
    {
        super();
        this._input = input;
        this._output = output;
    }

    clone(): PLam<A,B>
    {
        return new PLam(
            isCloneable( this._input ) ? this._input.clone() : this._input ,
            isCloneable( this._output ) ? this._output.clone() : this._output 
        ) as PLam<A,B>;
    }

}
