import Cloneable from "../../../types/interfaces/Cloneable";
import Integer from "../../../types/ints/Integer";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import TermInt, { addPIntMethods } from "../Prelude/TermInt";
import PType from "../PType";
import Term from "../Term";
import Type from "../Term/Type";

export default class PInt extends PType
    implements Cloneable<PInt>
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

    static override get default(): PInt { return new PInt( 0 ) }

    clone(): PInt
    {
        return new PInt( this._pint );
    }
}

export function pInt( int: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            Type.Int,
            _dbn => UPLCConst.int( int )
        )
    );
}