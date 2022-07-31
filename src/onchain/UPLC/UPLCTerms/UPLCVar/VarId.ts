import JsRuntime from "../../../../../utils/JsRuntime";

/**
 * @private
 * @static
 */
let _counter : bigint = BigInt( 0 );

export default class VarId
{
    private _id: symbol;

    getId(): symbol
    {
        return this._id;
    }

    constructor()
    {
        this._id = Symbol( _counter.toString(36) );
        _counter++;
        
        const resultObj = JsRuntime.objAsReadonly(
            JsRuntime.objWithUnderscoreAsPrivate(
                this
            )
        ) as unknown as VarId;

        return resultObj;
    }
}