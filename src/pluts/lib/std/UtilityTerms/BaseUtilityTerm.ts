import { UtilityTermOf } from "./addUtilityForType";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { TermType } from "../../../../type_system/types";
import { hasOwn, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { term_as } from "../../punsafeConvertType";
import { Term } from "../../../Term";
import { PType } from "../../../PType";

export type BaseUtilityTermExtension = {
    readonly as: <T extends TermType>( t: T ) => UtilityTermOf<ToPType<T>>
}

export function addBaseUtilityTerm<PT extends PType>( term: Term<PT> ): Term<PT> & BaseUtilityTermExtension
{
    if(
        !hasOwn( term, "as" ) ||
        typeof term.as !== "function" ||
        term.as === (Term.prototype as any).as
    )
    {
        defineReadOnlyProperty(
            term, "as", term_as.bind( term )
        );
    }

    return term as any;
}