import ByteString from "../../../types/HexString/ByteString";
import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";

export default class PString extends PType
    implements Cloneable<PString>
{
    private _pstring: string

    constructor( str: string = "" )
    {
        super();
        this._pstring = str;
    }

    static override get default(): PString
    {
        return new PString( "" );
    }

    clone(): PString
    {
        return new PString( this._pstring )
    }
}

export function pStr( str: string ): Term<PString>
{
    return new Term<PString>( dbn => UPLCConst.str( str ) , new PString( str ) );
}

export const pString = pStr;