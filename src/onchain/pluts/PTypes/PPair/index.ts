import JsRuntime from "../../../../utils/JsRuntime";
import PType, { PDataRepresentable } from "../../PType";
import { phoist, plam } from "../../Syntax/syntax";
import Term from "../../Term";
import Type, { ConstantableTermType, data, DataType, pair, TermType, ToPType } from "../../Term/Type/base";
import { typeExtends } from "../../Term/Type/extension";
import PData from "../PData/PData";
import PLam from "../PFn/PLam";
import { punsafeConvertType } from "../../Syntax";
import { isConstantableTermType } from "../../Term/Type/kinds";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { termTyToConstTy } from "../../Term/Type/constTypeConversion";
import TermPair, { addPPairMethods } from "../../stdlib/TermPair";
import ObjectUtils from "../../../../utils/ObjectUtils";

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

export function pPair<FstT extends ConstantableTermType, SndT extends ConstantableTermType>(
    fstT: FstT,
    sndT: SndT
): ( fst: Term<ToPType<FstT>>, snd: Term<ToPType<SndT>> ) => TermPair<ToPType<FstT>,ToPType<SndT>>
{
    JsRuntime.assert(
        isConstantableTermType( fstT ),
        "plutus only supports pairs of types that can be converted to constants"
    );
    JsRuntime.assert(
        isConstantableTermType( sndT ),
        "plutus only supports pairs of types that can be converted to constants"
    );

    return ( _fst: Term<ToPType<FstT>>, _snd: Term<ToPType<SndT>> ): TermPair<ToPType<FstT>,ToPType<SndT>> => {

        JsRuntime.assert(
            _fst instanceof Term &&
            (_fst as any).isConstant &&
            typeExtends( _fst.type, fstT ),
            "first element of a constant pair was not a constant"
        );
        JsRuntime.assert(
            _snd instanceof Term &&
            (_snd as any).isConstant &&
            typeExtends( _snd.type, sndT ),
            "second element of a constant pair was not a constant"
        );
        
        return addPPairMethods(
            new Term<PPair<ToPType<FstT>,ToPType<SndT>>>(
                pair( fstT, sndT ),
                dbn => UPLCConst.pairOf(
                    termTyToConstTy( fstT ),
                    termTyToConstTy( sndT )
                )(
                    (_fst.toUPLC( dbn ) as UPLCConst).value,
                    (_snd.toUPLC( dbn ) as UPLCConst).value
                ),
                true // isConstant
            )
        );
    }
}