import JsRuntime from "../../../../../utils/JsRuntime";
// !!! IMPORTANT !!!
// `isWellFormedType` is used both here and by `addPPairMethods`
// DO NOT change the order of the two imports
import { TermType, ToPType, typeExtends, pair, isWellFormedType, asData } from "../../../type_system";
import { TermPair, addPPairMethods } from "../../std/UtilityTerms/TermPair";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { PPair } from "../../../PTypes";
import { Term } from "../../../Term";
import { Machine } from "../../../../CEK/Machine";
import { termTyToConstTy } from "../../../type_system/termTyToConstTy";
import { toData_minimal } from "../data/conversion/toData_minimal";
import { punsafeConvertType } from "../../punsafeConvertType";
import { ppairData } from "../../builtins/ppairData";
import { PappArg, pappArgToTerm } from "../../pappArg";


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
            typeExtends( fst.type, fstT ),
            "first element of a constant pair was not a constant"
        );
        JsRuntime.assert(
            snd instanceof Term &&
            typeExtends( snd.type, sndT ),
            "second element of a constant pair was not a constant"
        );

        if(
            !(fst as any).isConstant ||
            !(snd as any).isConstant
        ){

            let _fst_ = toData_minimal( fstT )( fst );
            let _snd_ = toData_minimal( sndT )( snd );

            if( (fst as any).isConstant )
            {
                _fst_ = new Term(
                    _fst_.type,
                    _dbn => Machine.evalSimple( _fst_ )
                ) as any
            }

            if( (snd as any).isConstant )
            {
                _snd_ = new Term(
                    _snd_.type,
                    _dbn => Machine.evalSimple( snd )
                ) as any
            }

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
            new Term<PPair<ToPType<FstT>,ToPType<SndT>>>(
                pair( fstT, sndT ) as any ,
                dbn => UPLCConst.pairOf(
                    termTyToConstTy( fstT ),
                    termTyToConstTy( sndT )
                )(
                    (Machine.evalSimple( fst ) as UPLCConst).value,
                    (Machine.evalSimple( snd ) as UPLCConst).value
                ),
                true // isConstant
            )
        );
    }
}