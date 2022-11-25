import { PPair, PType, Term } from "..";
import { pfstPair, psndPair } from "../stdlib/Builtins";
import ObjectUtils from "../../../utils/ObjectUtils";
import { isPairType } from "../Term/Type/kinds";
import { UtilityTermOf } from "./UtilityTerms/addUtilityForType";
import BasePlutsError from "../../../errors/BasePlutsError";


type TermPair<PFst extends PType, PSnd extends PType> = Term<PPair<PFst,PSnd>> & {

    readonly fst: UtilityTermOf<PFst>

    readonly snd: UtilityTermOf<PSnd>
    
}

export default TermPair;

export function addPPairMethods<PFst extends PType, PSnd extends PType>( pair: Term<PPair<PFst,PSnd>>)
{
    const pairT = pair.type;

    if( !isPairType( pairT ) )
    {
        throw new BasePlutsError(
            "can't add pair methods to a term that is not a pair"
        );
    };

    const fstT =  pairT[1];
    const sndT = pairT[2];

    ObjectUtils.defineReadOnlyProperty(
        pair,
        "fst",
        pfstPair( fstT, sndT ).$( pair )
    );
    ObjectUtils.defineReadOnlyProperty(
        pair,
        "snd",
        psndPair( fstT, sndT ).$( pair )
    );

    return pair as any;
}