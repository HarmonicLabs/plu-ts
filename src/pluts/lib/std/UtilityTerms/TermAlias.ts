import type { PType } from "../../../PType"
import type { PAlias } from "../../../PTypes"
import type { Term } from "../../../Term"
import type { Methods } from "../../../../type_system"
import type { UtilityTermOf } from "./addUtilityForType"
import type { BaseUtilityTermExtension } from "./BaseUtilityTerm"
import type { FilterMethodsByInput, LiftMethods, MethodsAsTerms } from "./userMethods/methodsTypes"


/**
 * basically unwraps the alias until it finds an actual type
**/
type ActualTermUtility<PT extends PType> =
    PT extends PAlias<infer ActualT extends PType, any> ?
        ActualTermUtility<ActualT> :
        UtilityTermOf<PT>


type ActualTermAlias<PT extends PType, AMethods extends Methods> =
    Term<PAlias<PT, AMethods>> & 
    ActualTermUtility<PT> & 
    LiftMethods<
        FilterMethodsByInput<AMethods,PAlias<PT, any>>
    > & 
    MethodsAsTerms<
        FilterMethodsByInput<AMethods,PAlias<PT, any>>
    >

export type TermAlias<PT extends PType, AMethods extends Methods> = (
    // if the type is already an alias
    PT extends PAlias<infer PAliased extends PType, infer AMethods extends Methods> ?
        // add utility of the actual type
        ActualTermAlias<PAliased, AMethods> :
        // else add utility to this type (aliased)
        ActualTermAlias<PT, AMethods>
) & BaseUtilityTermExtension

// `addPAliasMethod` is (necessarily) mutually recursive with `addUtilityForType`
// so it is defined in "../addUtilityForType.ts"