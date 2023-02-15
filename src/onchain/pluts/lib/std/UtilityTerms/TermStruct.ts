import ObjectUtils from "../../../../../utils/ObjectUtils";
import type { Term } from "../../../Term";
import type { PStruct, RestrictedStructInstance } from "../../../PTypes/PStruct/pstruct";
import type { PType } from "../../../PType";
import type { IsSingleKey } from "../../../../../utils/ts/SingleKeyObj";

import { capitalize } from "../../../../../utils/ts/capitalize";
// !!! IMPORTANT !!!
// DO NOT change the order of imports
// `../../../Term/Type/kinds` is also a dependecy of `pmatch`
import { pmatch } from "../../../PTypes/PStruct/pmatch";
import { StructDefinition, StructCtorDef, isStructType, isStructDefinition } from "../../../type_system";


export type TermStruct<SDef extends StructDefinition> = Term<PStruct<SDef>> & {
    /*
    eqTerm: TermFn<[PStruct<SDef>], PBool>
    eq: ( other: Term<PStruct<SDef>> ) => TermBool
    //*/
} & 
(
    IsSingleKey<SDef> extends true ?
    (
        SDef[keyof SDef] extends infer CtorDef extends StructCtorDef ? {
            extract: <Fields extends (keyof CtorDef)[]>( ...fields: Fields ) => {
                in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
            }
        } : never
    )
    : {}
);

export function addPStructMethods<SDef extends StructDefinition>( struct: Term<PStruct<SDef>> ): TermStruct<SDef>
{
    const t = struct.type;
    if( !isStructType(t) ) return struct as any;

    const sDef = t[1] as SDef;
    if( typeof sDef === "symbol" || !isStructDefinition( sDef ) ) return struct as any;

    const ctors = Object.keys( sDef );

    // shortcut for single ctors structs
    if( ctors.length === 1 )
    {
        const ctor = ctors[0];
        ObjectUtils.defineReadOnlyProperty(
            struct,
            "extract",
            <Fields extends (keyof SDef[keyof SDef])[]>( ...fields: Fields ): {
                in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<SDef[keyof SDef],Fields> ) => Term<PExprResult> ) => Term<PExprResult>
            } => {
                return {
                    in: ( expr ) =>
                        pmatch( struct )
                        [( "on" + capitalize( ctor ) ) as any]( rawFields => rawFields.extract( ...fields ).in( expr ) ) as any
                }
            }
        )
    }

    /*
    ObjectUtils.defineReadOnlyProperty(
        struct, "eqTerm", peqData.$( struct as any )
    )

    ObjectUtils.defineReadOnlyProperty(
        struct, "eq", ( other: Term<PStruct<SDef>> ) => peqData.$( struct as any ).$( other as any )
    )
    //*/

    return struct as any;
}