import JsRuntime from "../../../../../utils/JsRuntime";
// !!! IMPORTANT !!!
// `isConstantableTermType` is used both here and by `addPPairMethods`
// DO NOT change the order of the two imports
import { isConstantableTermType } from "../../../Term/Type/kinds";
import { TermPair, addPPairMethods } from "../../std/UtilityTerms/TermPair";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { PPair } from "../../../PTypes";
import { ConstantableTermType, Term, typeExtends, pair } from "../../../Term";
import { termTyToConstTy } from "../../../Term/Type/constTypeConversion";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";


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