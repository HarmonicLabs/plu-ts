import JsRuntime from "../../../utils/JsRuntime";
import { pfstPair, ppairData, psndPair, punMapData } from "../Prelude/Builtins";
import PType, { PDataRepresentable } from "../PType";
import { plet } from "../Syntax";
import Term from "../Term";
import Type, { DataType, TermType } from "../Term/Type";
import { typeExtends } from "../Term/Type/extension";
import PData from "./PData";
import PDataMap from "./PData/PDataMap";
import PDataPair from "./PData/PDataPair";
import PList from "./PList";

export default class PPair<A extends PType, B extends PType > extends PDataRepresentable
{
    private _a: A
    private _b: B

    constructor( a: A = new PType as A, b: B = new PType as B )
    {
        super();

        this._a = a;
        this._b = b;
    }

    static override get termType(): TermType { return Type.Pair( Type.Any, Type.Any ) };
    static override fromData<PDataFst extends PData, PDataSnd extends PData>(data: Term<PDataPair<PDataFst,PDataSnd>>): Term<PPair<PDataFst, PDataSnd>>
    {
        JsRuntime.assert(
            typeExtends( data.type , Type.Data.Pair( Type.Data.Any,Type.Data.Any ) ) ||
            typeExtends( data.type , Type.Pair( Type.Data.Any,Type.Data.Any ) ),
            "cannot get a pair using 'PPair.fromData'"
        );

        return new Term(
            Type.Pair( data.type[1] as DataType, data.type[2] as DataType ),
            data.toUPLC
        );
    }
    static override toData(term: Term<PPair<PData,PData>>): Term<PDataPair<PData, PData>>
    {
        const data = Type.Data.Any;
        return plet( term ).in( pair =>
            ppairData( data, data )
                .$( pfstPair( data, data ).$( pair ) )
                .$( psndPair( data, data ).$( pair ) )
        );
    }
}

export class PMap<PKey extends PType, PValue extends PType> extends PList<PPair<PKey,PValue>>
{
    constructor(){ super(); }

    static override get fromData():
        <PDataFst extends PData, PDataSnd extends PData>
        (data: Term<PDataMap<PDataFst,PDataSnd>>) => Term<PMap<PDataFst, PDataSnd>>
    {
        return <PDataFst extends PData, PDataSnd extends PData>(data: Term<PDataMap<PDataFst,PDataSnd>>) => {
            return punMapData( Type.Data.Any, Type.Data.Any ).$( data ) as any;
        }
    }
}