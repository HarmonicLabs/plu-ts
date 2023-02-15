import ObjectUtils from "../../../../../utils/ObjectUtils";
import { Application } from "../../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { HoistedUPLC } from "../../../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../../UPLC/UPLCTerms/UPLCVar";
import { PLam, PInt, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { fn, int, bool } from "../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { TermBool, addPBoolMethods } from "../../std";
import { _pflipUPLC } from "../_pflipUPLC";
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

function intBinOpToBool( builtin: Builtin )
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
                // @ts-ingore Type instantiation is excessively deep and possibly infinite.
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


export const peqInt     = intBinOpToBool( Builtin.equalsInteger );
export const plessInt   = intBinOpToBool( Builtin.lessThanInteger );
export const plessEqInt = intBinOpToBool( Builtin.lessThanEqualInteger );




// @ts-ignore Type instantiation is excessively deep and possibly infinite.
export const pgreaterInt = addApplications<[ PInt, PInt ], PBool>( 
        new Term<PLam<PInt, PLam<PInt, PBool>>>(
        fn([ int, int ], bool ),
        _dbn => new HoistedUPLC(
            new Application(
                _pflipUPLC.clone(),

                plessInt.toUPLC( 0 )
            
            )
        )
    )
);

export const pgreaterEqInt = addApplications<[ PInt, PInt ], PBool>( 
    new Term<PLam<PInt, PLam<PInt, PBool>>>(
    fn([ int, int ], bool ),
    _dbn => new HoistedUPLC(
        new Application(
            _pflipUPLC.clone(),

            plessEqInt.toUPLC( 0 )
        
        )
    )
)
);