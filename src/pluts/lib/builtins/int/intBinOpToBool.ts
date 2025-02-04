import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PLam, PInt, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { fn, int, bool } from "../../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { TermBool, addPBoolMethods } from "../../std/UtilityTerms/TermBool";
import { _pflipIR } from "../_pflipIR";
import { addApplications } from "../addApplications";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { IRApp } from "../../../../IR/IRNodes/IRApp";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";

export type IntBinOPToBool = Term<PLam<PInt, PLam<PInt, PBool>>>
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

    return  defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PInt> ): Term<PLam<PInt, PBool>> => {
            const oneIn =
                papp( op, fstIn );
            
            return defineReadOnlyProperty(
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
        (cfg, _dbn) => new IRHoisted(
            new IRApp(
                _pflipIR.clone(),
                plessInt.toIR( cfg, 0 )
            )
        )
    )
);

export const pgreaterEqInt = addApplications<[ PInt, PInt ], PBool>( 
    new Term<PLam<PInt, PLam<PInt, PBool>>>(
    fn([ int, int ], bool ),
    (cfg, _dbn) => new IRHoisted(
        new IRApp(
            _pflipIR,
            plessEqInt.toIR( cfg, 0 )
        )
    )
)
);