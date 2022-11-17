import Integer from "../../../types/ints/Integer";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pIntToData, punIData } from "../stdlib/Builtins";
import TermInt, { addPIntMethods } from "../stdlib/UtilityTerms/TermInt";
import { PDataRepresentable } from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type/base";
import PData from "./PData/PData";
import PDataInt from "./PData/PDataInt";
import PLam from "./PFn/PLam";
import { PappArg } from "../Syntax/pappArg";

export default class PInt extends PDataRepresentable
//    implements Cloneable<PInt>
{
    private _pint: bigint
    get pint(): bigint { return this._pint }

    constructor( int: Integer | number | bigint = 0 )
    {
        super();

        if( typeof int === "number" ) int = BigInt( int );
        if( int instanceof Integer ) int = int.asBigInt;

        this._pint = int;
    }

    static override get termType(): TermType { return Type.Int }

    static override get fromDataTerm(): Term<PLam<PData, PInt>> & { $: (input: PappArg<PData>) => Term<PInt>; }
    {
        return punIData;
    }
    /**
     * @deprecated try to use 'fromDataTerm.$'
     */
    static override fromData(data: Term<PData>): TermInt
    {
        return addPIntMethods( punIData.$( data ) )
    }
    
    static override get toDataTerm(): Term<PLam<any, PData>> & { $: (input: PappArg<any>) => Term<PData>; }
    {
        return pIntToData as any;
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static override toData( int: Term<PInt> ): Term<PDataInt>
    {
        return pIntToData.$( int );
    }
}

export function pInt( int: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            Type.Int,
            _dbn => UPLCConst.int( int ),
            true
        )
    );
}