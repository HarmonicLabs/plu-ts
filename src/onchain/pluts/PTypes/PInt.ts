import Integer from "../../../types/ints/Integer";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";

export default class PInt extends PType
{
    private _pint?: bigint
}

export function pint( int: Integer | number | bigint ): Term<PInt>
{
    return new Term<PInt>( dbn => UPLCConst.int( int ) )
}