import PData from ".";
import DataI from "../../../../types/Data/DataI";
import Integer from "../../../../types/ints/Integer";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { pIntToData, punIData } from "../../Prelude/Builtins";
import Term from "../../Term";
import Type from "../../Term/Type";
import PInt from "../PInt";

export default class PDataInt extends PData // (PData extends PType => PDataInt extends PType too)
{
    constructor( int: number | bigint | Integer = 0 )
    {
        super( new DataI( int ) );
    }
}

export function pDataI( int: number | bigint | Integer ): Term<PDataInt>
{
    return new Term(
        Type.Data.Int,
        _dbn => UPLCConst.data( new DataI( int ) )
    );
}

export function ptoDataI( intTerm: Term<PInt> ): Term<PDataInt>
{
    return pIntToData.$( intTerm );
}

export function pIntFromData( dataIntTerm: Term<PDataInt> ): Term<PInt>
{
    return punIData.$( dataIntTerm );
}