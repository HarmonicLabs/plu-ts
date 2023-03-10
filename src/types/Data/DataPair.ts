import JsRuntime from "../../utils/JsRuntime";

import { Data, isData } from "./Data";
import { Cloneable } from "../interfaces/Cloneable";


export class DataPair<DataFst extends Data, DataSnd extends Data>
    implements Cloneable<DataPair<DataFst,DataSnd>>
{
    private _fst: DataFst;
    get fst(): DataFst { return Object.freeze( this._fst ) };
    set fst( v: DataFst )
    {
        JsRuntime.assert(
            isData( v ),
            `invalid Data passed setting 'fst' in 'DataPair'; value: ${v}`
        );
        this._fst = v
    };

    private _snd: DataSnd;
    get snd(): DataSnd { return Object.freeze( this._snd ) };
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
        this._fst = fst.clone() as any;
        this._snd = snd.clone() as any;
    }

    clone(): DataPair<DataFst,DataSnd>
    {
        // the constructor clones both fst and snd
        return new DataPair( this.fst, this.snd ) as any;
    }
}