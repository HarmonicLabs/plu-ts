import Integer from "../../../types/ints/Integer";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pIntToData, punIData } from "../Prelude/Builtins";
import TermInt, { addPIntMethods } from "../Prelude/TermInt";
import { PDataRepresentable } from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PDataInt from "./PData/PDataInt";

export default class PInt extends PDataRepresentable
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
    static override fromData(data: Term<PDataInt>): TermInt
    {
        return addPIntMethods( punIData.$( data ) )
    }
    static override toData( int: Term<PInt> ): Term<PDataInt>
    {
        return pIntToData.$( int );
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