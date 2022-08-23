import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";

export default class PBool extends PType
    implements Cloneable< PBool >
{
    private _pbool: boolean

    constructor( bool: boolean = false )
    {
        super();
        this._pbool = bool;
    }

    static override get default(): PBool { return new PBool( false ); }

    clone(): PBool
    {
        return new PBool( this._pbool );
    }
}

export function pBool( bool: boolean ): Term<PBool>
{
    return new Term<PBool>( dbn => UPLCConst.bool( bool ), new PBool( bool ) );
}