import Data, { isData } from ".";
import JsRuntime from "../../utils/JsRuntime";
import Cloneable from "../interfaces/Cloneable";


export default class DataPair<DataFst extends Data, DataSnd extends Data>
    implements Cloneable<DataPair<DataFst,DataSnd>>
{
    private _fst: DataFst;
    get fst(): DataFst { return this._fst };
    set fst( v: DataFst )
    {
        JsRuntime.assert(
            isData( v ),
            `invalid Data passed setting 'fst' in 'DataPair'; value: ${v}`
        );
        this._fst = v
    };

    private _snd: DataSnd;
    get snd(): DataSnd { return this._snd };
    set snd( v: DataSnd )
    {
        JsRuntime.assert(
            isData( v ),
            `invalid Data passed setting 'snd' in 'DataPair'; value: ${v}`
        );
        this._snd = v
    };

    constructor( fst: DataFst, snd: DataSnd )
    {
        JsRuntime.assert(
            isData( fst ) && isData( snd ),
            `invalid Data passed to 'DataPair' constructor; fst: ${fst}; snd: ${snd}`
        );
        this._fst = fst;
        this._snd = snd;
    }

    clone(): DataPair<DataFst,DataSnd>
    {
        return new DataPair( this.fst.clone(), this.snd.clone() ) as any;
    }
}