import ObjectUtils from "../../../../utils/ObjectUtils";
import capitalize from "../../../../utils/ts/capitalize";
import { IsSingleKey } from "../../../../utils/ts/SingleKeyObj";
import PType from "../../PType";
import { ConstantableStructDefinition, PStruct, RestrictedStructInstance, StructCtorDef } from "../../PTypes/PStruct/pstruct";
import pmatch from "../../PTypes/PStruct/pmatch";
import Term from "../../Term";
import { isStructDefinition, isStructType } from "../../Term/Type/kinds";

type TermStruct<SDef extends ConstantableStructDefinition> = Term<PStruct<SDef>> // & {} // if other methods are needed
& 
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

export default TermStruct;

export function addPStructMethods<SDef extends ConstantableStructDefinition>( struct: Term<PStruct<SDef>> ): TermStruct<SDef>
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
                    in: ( expr ) => pmatch( struct )[( "on" + capitalize( ctor ) ) as any]( rawFields => rawFields.extract( ...fields ).in( expr ) ) as any
                }
            }
        )
    }

    return struct as any;
}