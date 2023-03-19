import JsRuntime from "../../../../../utils/JsRuntime";
// !!! IMPORTANT !!!
// `isWellFormedType` is used both here and by `addPPairMethods`
// DO NOT change the order of the two imports
import { TermType, ToPType, typeExtends, pair, isWellFormedType, asData, data } from "../../../type_system";
import { TermPair, addPPairMethods } from "../../std/UtilityTerms/TermPair";
import { PPair } from "../../../PTypes";
import { Term } from "../../../Term";
import { Machine } from "../../../../CEK/Machine";
import { _toData } from "../data/conversion/toData_minimal";
import { punsafeConvertType } from "../../punsafeConvertType";
import { ppairData } from "../../builtins/ppairData";
import { PappArg, pappArgToTerm } from "../../pappArg";
import { unwrapAsData } from "../../../type_system/tyArgs/unwrapAsData";
import { IRConst } from "../../../../IR/IRNodes/IRConst";


export function pPair<FstT extends TermType, SndT extends TermType>(
    fstT: FstT,
    sndT: SndT
): ( fst: PappArg<ToPType<FstT>>, snd: PappArg<ToPType<SndT>> ) => TermPair<ToPType<FstT>,ToPType<SndT>>
{
    JsRuntime.assert(
        isWellFormedType( fstT ),
        "plutus only supports pairs of types that can be converted to constants"
    );
    JsRuntime.assert(
        isWellFormedType( sndT ),
        "plutus only supports pairs of types that can be converted to constants"
    );

    return ( _fst: PappArg<ToPType<FstT>>, _snd: PappArg<ToPType<SndT>> ): TermPair<ToPType<FstT>,ToPType<SndT>> => {

        if(!( _fst instanceof Term ))
        _fst = pappArgToTerm( _fst, fstT );

        if(!( _snd instanceof Term ))
        _snd = pappArgToTerm( _snd, sndT );

        const fst = _fst as Term<ToPType<FstT>>;
        const snd = _snd as Term<ToPType<SndT>>;

        JsRuntime.assert(
            fst instanceof Term &&
            (
                typeExtends( fst.type, fstT ) ||
                typeExtends( fst.type, unwrapAsData( fstT as any ) ) ||
                typeExtends( fst.type, data )
            ),
            "first element of a constant pair was not a constant"
        );
        JsRuntime.assert(
            snd instanceof Term &&
            (
                typeExtends( snd.type, sndT ) ||
                typeExtends( snd.type, unwrapAsData( sndT as any) ) ||
                typeExtends( snd.type, data )
            ),
            "second element of a constant pair was not a constant"
        );

        let _fst_ = _toData( unwrapAsData( fstT as any ) )( fst );
        let _snd_ = _toData( unwrapAsData( sndT as any ) )( snd );

        if(
            !(fst as any).isConstant ||
            !(snd as any).isConstant
        ){
            return punsafeConvertType(
                ppairData
                .$( _fst_ )
                .$( _snd_ ),
                pair(
                    asData( fstT ),
                    asData( sndT )
                )
            ) as any;
        }
        
        return addPPairMethods(
            // al pairs MUST have `asData` elements
            // causes problem in uplc generation otherwhise
            new Term<PPair<ToPType<FstT>,ToPType<SndT>>>(
                pair( asData( fstT ), asData( sndT ) ) as any ,
                _dbn => IRConst.pairOf(
                    data,
                    data
                )(
                    (Machine.evalSimple( _fst_ ) as IRConst).value,
                    (Machine.evalSimple( _snd_ ) as IRConst).value
                ),
                true // isConstant
            )
        );
    }
}