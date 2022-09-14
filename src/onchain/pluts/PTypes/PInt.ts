import Integer from "../../../types/ints/Integer";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { punIData } from "../Prelude/Builtins";
import TermInt, { addPIntMethods } from "../Prelude/TermInt";
import PType from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PData from "./PData";
import PDataInt from "./PData/PDataInt";

export default class PInt extends PType
//    implements Cloneable<PInt>
{
    private _pint: bigint
    get pint(): bigint { return this._pint }

    constructor( int: Integer | number | bigint = 0 )
    {
        super();

        if( typeof int === "number" ) int = BigInt( int );
        if( int instanceof Integer ) int = int.asBigInt;

        this._pint = int;
    }

    static override get termType(): TermType { return Type.Int }
    static override get fromData(): (data: Term<PDataInt>) => TermInt {
        return (data: Term<PDataInt>) => addPIntMethods( punIData.$( data ) )
    }
}

export function pInt( int: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            Type.Int,
            _dbn => UPLCConst.int( int ),
            true
        )
    );
}