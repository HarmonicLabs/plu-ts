import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { PType } from "../../../PType";
import { PAsData, PPair } from "../../../PTypes";
import { Term } from "../../../Term";
import { isWellFormedType, termTypeToString, typeExtends } from "../../../type_system";
import { getFstT, getSndT } from "../../../type_system/tyArgs";
import { tyVar, pair, TermType, PrimType } from "../../../type_system/types";
import { UtilityTermOf } from "../../addUtilityForType";
import { pfstPair, psndPair } from "../../builtins";

type UnwrapPAsData<PT extends PType> = 
    PT extends PAsData<infer PTy extends PType> ? PTy :
    PT

export type TermPair<PFst extends PType, PSnd extends PType> = Term<PPair<PFst,PSnd>> & {

    readonly fst: UtilityTermOf<UnwrapPAsData<PFst>>

    readonly snd: UtilityTermOf<UnwrapPAsData<PSnd>>
    
}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPPairMethods<PFst extends PType, PSnd extends PType>( _pair: Term<PPair<PFst,PSnd>>)
{
    const pairT = _pair.type;

    if( !typeExtends( pairT, pair( tyVar(), tyVar() ) ) )
    {
        throw new BasePlutsError(
            "can't add pair methods to a term that is not a pair"
        );
    };

    // MUST NOT unwrap `asData`
    let fstT: TermType = pairT[1] as TermType;
    while( fstT[0] === PrimType.Alias ) fstT = fstT[1];

    // MUST NOT unwrap `asData`    
    let sndT: TermType = pairT[2] as TermType;
    while( sndT[0] === PrimType.Alias ) sndT = sndT[1];


    if( isWellFormedType( fstT ) )
        ObjectUtils.definePropertyIfNotPresent(
            _pair,
            "fst",
            {
                get: () => pfstPair( fstT, sndT ).$( _pair ),
                ...getterOnly
            }
        );
    if( isWellFormedType( sndT ) )
        ObjectUtils.definePropertyIfNotPresent(
            _pair,
            "snd",
            {
                get: () => psndPair( fstT, sndT ).$( _pair ),
                ...getterOnly
            }
        );

    return _pair as any;
}