

export default class Ref<ObjType>
{
    private _ref: ObjType;

    constructor( ref: ObjType )
    {
        this._ref = ref;
    }

    get(): ObjType
    {
        return this._ref;
    }

    overwrite( newRef: ObjType )
    {
        this._ref = newRef;
    }
}