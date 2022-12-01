import PPair, { pPair } from ".";
import { PData } from "../..";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { ppairData } from "../../stdlib/Builtins";
import TermPair, { addPPairMethods } from "../../stdlib/UtilityTerms/TermPair";
import Term from "../../Term";
import { ConstantableTermType, typeExtends, pair, data } from "../../Term/Type";
import { isConstantableTermType } from "../../Term/Type/kinds";
import { ToPType } from "../../Term/Type/ts-pluts-conversion";
import { getToDataForType } from "../PData/conversion/getToDataTermForType";

export function pdynPair<FstT extends ConstantableTermType, SndT extends ConstantableTermType>(
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

    return ( _fst: Term<ToPType<FstT>> | Term<PData>, _snd: Term<ToPType<SndT>> | Term<PData> ): TermPair<ToPType<FstT>,ToPType<SndT>> => {

        JsRuntime.assert(
            _fst instanceof Term,
            "the first element of a pair was not a term"
        );
        JsRuntime.assert(
            _snd instanceof Term,
            "the second element of a pair was not a term"
        );

        const fstIsData = typeExtends( _fst.type, data );
        const sndIsData = typeExtends( _snd.type, data );
        
        JsRuntime.assert(
            fstIsData || typeExtends( _fst.type, fstT ),
            "first element of a dynamic pair was not of the correct type"
        );
        JsRuntime.assert(
            sndIsData || typeExtends( _snd.type, sndT ),
            "second element of a dynamic pair was not of the correct type"
        );

        if(
            (_fst as any).isConstant &&
            (_snd as any).isConstant &&
            (!(
                fstIsData || sndIsData
            ))
        )
        {
            return pPair( fstT, sndT )( _fst as Term<ToPType<FstT>>, _snd as Term<ToPType<SndT>> );
        }
        
        return addPPairMethods(
            // IMPORTANT
            //
            // `__isDynamicPair` NEEDS to be added
            // BEFORE `addPPairMethods` so that
            // `fst` and `snd` can handle data conversion
            ObjectUtils.defineReadOnlyHiddenProperty(
                new Term<PPair<ToPType<FstT>,ToPType<SndT>>>(
                    
                    // overrides the type
                    pair( fstT, sndT ),
                    
                    dbn => ppairData( data, data )
                        // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                        .$( fstIsData ? _fst as Term<PData> : getToDataForType( fstT )( _fst as Term<ToPType<FstT>> ) )
                        // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                        .$( sndIsData ? _snd as Term<PData> : getToDataForType( sndT )( _snd as Term<ToPType<SndT>> ) )
                        .toUPLC( dbn )

                ),
                // necessary to unwrap the data when using `pfstPair` and `psndPair`
                "__isDynamicPair",
                true
            )
        );
    }
}

export function pdataPairToDynamic<FstT extends ConstantableTermType, SndT extends ConstantableTermType>(
    fstT: FstT,
    sndT: SndT
): ( dataPair: Term<PData> ) => TermPair<ToPType<FstT>,ToPType<SndT>>
{
    return ( dataPair: Term<PData> ) => addPPairMethods(
        // IMPORTANT
        //
        // `__isDynamicPair` NEEDS to be added
        // BEFORE `addPPairMethods` so that
        // `fst` and `snd` can handle data conversion
        ObjectUtils.defineReadOnlyHiddenProperty(
            new Term<PPair<ToPType<FstT>,ToPType<SndT>>>(
                
                // overrides the type
                pair( fstT, sndT ),
                // keeps the term
                dataPair.toUPLC

            ),
            // necessary to unwrap the data when using `pfstPair` and `psndPair`
            "__isDynamicPair",
            true
        )
    );
}