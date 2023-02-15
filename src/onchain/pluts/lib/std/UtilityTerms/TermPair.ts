import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { PType } from "../../../PType";
import { PPair } from "../../../PTypes";
import { Term } from "../../../Term";
import { isWellFormedType, typeExtends } from "../../../type_system";
import { tyVar, pair, TermType } from "../../../type_system/types";
import { UtilityTermOf } from "../../addUtilityForType";
import { pfstPair, psndPair } from "../../builtins";

export type TermPair<PFst extends PType, PSnd extends PType> = Term<PPair<PFst,PSnd>> & {

    readonly fst: UtilityTermOf<PFst>

    readonly snd: UtilityTermOf<PSnd>
    
}

export function addPPairMethods<PFst extends PType, PSnd extends PType>( _pair: Term<PPair<PFst,PSnd>>)
{
    const pairT = _pair.type;

    if( !typeExtends( pairT, pair( tyVar(), tyVar() ) ) )
    {
        throw new BasePlutsError(
            "can't add pair methods to a term that is not a pair"
        );
    };

    const fstT = pairT[1] as TermType;
    const sndT = pairT[2] as TermType;

    if( isWellFormedType( fstT ) )
        // @ts-ignore
        ObjectUtils.defineReadOnlyProperty(
            _pair,
            "fst",
            // @ts-ignore
            pfstPair( fstT, sndT ).$( _pair )
        );
    if( isWellFormedType( sndT ) )
        // @ts-ignore
        ObjectUtils.defineReadOnlyProperty(
            _pair,
            "snd",
            // @ts-ignore
            psndPair( fstT, sndT ).$( _pair )
        );

    return _pair as any;
}