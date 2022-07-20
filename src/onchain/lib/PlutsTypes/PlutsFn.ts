import PlutsType from "../PlutsType";
import Term from "../Term";


export default class PlutsFn< PArgT extends PlutsType, PResultT extends PlutsType >
    implements PlutsType
{
    private _body: ( arg: PArgT ) => PResultT

    constructor( body: ( arg: PArgT ) => PResultT )
    {
        this._body = body.bind( this );
    }

    apply( withArg: PArgT ): PResultT
    {
        return this._body(  withArg );
    }
}