import JsRuntime from "../../../utils/JsRuntime";
import { pfstPair, pid, ppairData, psndPair, punMapData } from "../stdlib/Builtins";
import PType, { PDataRepresentable } from "../PType";
import { phoist, plam } from "../Syntax/syntax";
import Term from "../Term";
import Type, { data, DataType, pair, TermType } from "../Term/Type/base";
import { typeExtends } from "../Term/Type/extension";
import PData from "./PData/PData";
import PDataMap from "./PData/PDataMap";
import PLam from "./PFn/PLam";
import PList from "./PList";
import { punsafeConvertType } from "../Syntax";

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

    static override get fromDataTerm(): Term<PLam<PData, PPair<PData,PData>>> & { $: (input: Term<PData>) => Term<PPair<PData,PData>>; }
    {
        // hoists to id
        return phoist( plam( data, pair( data, data ) )( (PPair as any).fromData ) );
    }
    static override fromData<PDataFst extends PData, PDataSnd extends PData>(data: Term<PData>): Term<PPair<PDataFst, PDataSnd>>
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
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static override toData(term: Term<PPair<PData,PData>>): Term<PData>
    {
        return punsafeConvertType( term, Type.Data.Pair( data, data ) );
        /*
        return papp(
            phoist(
                plam( pair( data, data ), Type.Data.Pair( data, data ) )
                (
                    pair => ppairData( data, data )
                        .$( pfstPair( data, data ).$( pair ) )
                        .$( psndPair( data, data ).$( pair ) ) as any
                )
            ) as any,
            term
        );
        //*/
    }
}
