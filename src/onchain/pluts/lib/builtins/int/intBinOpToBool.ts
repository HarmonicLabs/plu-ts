import ObjectUtils from "../../../../../../../src/utils/ObjectUtils";
import { IRApp } from "../../../../../../../src/onchain/IR/IRNodes/IRApp";
import { IRHoisted } from "../../../../../../../src/onchain/IR/IRNodes/IRHoisted";
import { IRNative } from "../../../../../../../src/onchain/IR/IRNodes/IRNative";
import { PLam, PInt, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { fn, int, bool } from "../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { TermBool, addPBoolMethods } from "../../std/UtilityTerms/TermBool";
import { _pflipIR } from "../_pflipIR";
import { addApplications } from "../addApplications";

export type IntBinOPToBool = Term<PLam<PInt, PLam<PInt, PInt>>>
& {
    $: ( input: PappArg<PInt> ) => 
        Term<PLam<PInt,PBool>>
        & {
            $: ( input: PappArg<PInt> ) => 
                TermBool
        }
}

function intBinOpToBool( builtin: IRNative )
    : IntBinOPToBool
{
    const op = new Term<PLam<PInt, PLam<PInt, PBool>>>(
        fn([ int, int ], bool ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PInt> ): Term<PLam<PInt, PBool>> => {
            const oneIn =
                papp( op, fstIn );
            
            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PInt> ): TermBool => {
                    return addPBoolMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}


export const peqInt     = intBinOpToBool( IRNative.equalsInteger );
export const plessInt   = intBinOpToBool( IRNative.lessThanInteger );
export const plessEqInt = intBinOpToBool( IRNative.lessThanEqualInteger );

export const pgreaterInt = addApplications<[ PInt, PInt ], PBool>( 
        new Term<PLam<PInt, PLam<PInt, PBool>>>(
        fn([ int, int ], bool ),
        _dbn => new IRHoisted(
            new IRApp(
                _pflipIR.clone(),
                plessInt.toIR( 0 )
            )
        )
    )
);

export const pgreaterEqInt = addApplications<[ PInt, PInt ], PBool>( 
    new Term<PLam<PInt, PLam<PInt, PBool>>>(
    fn([ int, int ], bool ),
    _dbn => new IRHoisted(
        new IRApp(
            _pflipIR,
            plessEqInt.toIR( 0 )
        )
    )
)
);