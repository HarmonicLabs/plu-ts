import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";
import Type, { Type as Ty } from "../Term/Type";

/**
 * @fixme ```PBool``0 should be a ```PStruct```
 */
export default class PBool extends PType
    implements Cloneable< PBool >
{
    private _pbool: boolean

    constructor( bool: boolean = false )
    {
        super();
        this._pbool = bool;
    }

    clone(): PBool
    {
        return new PBool( this._pbool );
    }

    static override get termType(): Ty { return Type.Bool }
    // static override get fromData(): (data: Term<PData>) => TermInt {
    //     return (data: Term<PDataInt>) => addPIntMethods( punIData.$( data ) )
    // }
}

export function pBool( bool: boolean ): Term<PBool>
{
    return new Term<PBool>(
        Type.Bool,
        _dbn => UPLCConst.bool( bool ),
        true
    );
}