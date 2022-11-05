import { papp, PappResult } from "../syntax";
import ObjectUtils from "../../../../utils/ObjectUtils";
import Lambda from "../../../UPLC/UPLCTerms/Lambda";
import UPLCVar from "../../../UPLC/UPLCTerms/UPLCVar";
import PType from "../../PType";
import PLam from "../../PTypes/PFn/PLam";
import Term from "../../Term";
import Type, { FromPType } from "../../Term/Type/base";

export function plam<PTypeA extends PType, PTypeB extends PType>
(
    termFunc: ( input: Term<PTypeA> ) => Term<PTypeB>,
    inputType: FromPType<PTypeA> | undefined = undefined,
    outputTpe: FromPType<PTypeB> | undefined = undefined
): PappResult<PLam<PTypeA,PTypeB>>
{
    const _inputType = inputType ?? Type.Var("plam_input");
    const _outputType = outputTpe ?? Type.Var("plam_output");

    const lambdaTerm  = new Term<PLam<PTypeA,PTypeB>>(
        Type.Lambda( _inputType, _outputType ),
        dbn => {
            const thisLambdaPtr = dbn + BigInt( 1 );

            const boundVar = new Term<PTypeA>(
                _inputType as any,
                dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr )
            );
            
            // here the debruijn level is incremented
            return new Lambda( termFunc( boundVar ).toUPLC( thisLambdaPtr ) );
        }
    );

    // allows ```lambdaTerm.$( input )``` syntax
    // rather than ```papp( lambdaTerm, input )```
    // preserving Term Type
    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: Term<PTypeA> ) =>
        {
            return papp( lambdaTerm, input )
        }
    );
};