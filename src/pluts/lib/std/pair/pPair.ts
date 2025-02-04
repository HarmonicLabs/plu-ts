// !!! IMPORTANT !!!
// `isWellFormedType` is used both here and by `addPPairMethods`
// DO NOT change the order of the two imports
import { TermType, ToPType, typeExtends, pair, isWellFormedType, asData, data } from "../../../../type_system";
import { TermPair, addPPairMethods } from "../UtilityTerms/TermPair";
import { PPair } from "../../../PTypes";
import { Term } from "../../../Term";
import { _toData } from "../data/conversion/toData_minimal";
import { punsafeConvertType } from "../../punsafeConvertType";
import { ppairData } from "../../builtins/ppairData";
import { PappArg, pappArgToTerm } from "../../pappArg";
import { unwrapAsData } from "../../../../type_system/tyArgs/unwrapAsData";
import { assert } from "../../../../utils/assert";
import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { Machine } from "@harmoniclabs/plutus-machine";
import { clearAsData } from "../../../../type_system/tyArgs/clearAsData";


export function pPair<FstT extends TermType, SndT extends TermType>(
    fstT: FstT,
    sndT: SndT
): ( fst: PappArg<ToPType<FstT>>, snd: PappArg<ToPType<SndT>> ) => TermPair<ToPType<FstT>,ToPType<SndT>>
{
    assert(
        isWellFormedType( fstT ),
        "plutus only supports pairs of types that can be converted to constants"
    );
    assert(
        isWellFormedType( sndT ),
        "plutus only supports pairs of types that can be converted to constants"
    );

    return ( _fst: PappArg<ToPType<FstT>>, _snd: PappArg<ToPType<SndT>> ): TermPair<ToPType<FstT>,ToPType<SndT>> => {

        if(!( _fst instanceof Term ))
        _fst = pappArgToTerm( _fst, fstT ) as any ;

        if(!( _snd instanceof Term ))
        _snd = pappArgToTerm( _snd, sndT ) as any ;

        const fst = _fst as Term<ToPType<FstT>>;
        const snd = _snd as Term<ToPType<SndT>>;

        assert(
            fst instanceof Term &&
            (
                typeExtends( fst.type, fstT ) ||
                typeExtends( fst.type, clearAsData( fstT as any ) ) ||
                typeExtends( fst.type, data )
            ),
            "first element of a constant pair was not a constant"
        );
        assert(
            snd instanceof Term &&
            (
                typeExtends( snd.type, sndT ) ||
                typeExtends( snd.type, clearAsData( sndT as any ) ) ||
                typeExtends( snd.type, data )
            ),
            "second element of a constant pair was not a constant"
        );

        let _fst_ = _toData( clearAsData( fstT as any ) )( fst );
        let _snd_ = _toData( clearAsData( sndT as any ) )( snd );

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