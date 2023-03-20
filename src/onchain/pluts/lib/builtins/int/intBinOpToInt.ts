import ObjectUtils from "../../../../../utils/ObjectUtils";
import { IRTerm } from "../../../../IR/IRTerm";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { PLam, PInt } from "../../../PTypes";
import { Term } from "../../../Term";
import { fn, int } from "../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { TermInt } from "../../std";


export type IntBinOPToInt = Term<PLam<PInt, PLam<PInt, PInt>>>
& {
    $: ( input: PappArg<PInt> ) => 
        Term<PLam<PInt,PInt>>
        & {
            $: ( input: PappArg<PInt> ) => 
                TermInt
        }
}

export function intBinOpToInt( builtin: IRTerm )
    : IntBinOPToInt
{
    const op = new Term<PLam<PInt, PLam<PInt, PInt>>>(
        fn([ int, int ], int ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: PappArg<PInt> ): Term<PLam<PInt, PInt>> => {

            const oneIn =
                // @ts-ingore Type instantiation is excessively deep and possibly infinite.
                papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: PappArg<PInt> ): TermInt => {
                    return papp( oneIn, sndIn )
                }
            );
        }
    ) as any;
}