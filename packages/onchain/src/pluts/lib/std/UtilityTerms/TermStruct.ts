import { Term } from "../../../Term";
import type { PStruct, RestrictedStructInstance, StructInstance } from "../../../PTypes/PStruct/pstruct";
import type { PType } from "../../../PType";
import type { TermFn } from "../../../PTypes/PFn/PFn";
// !!! IMPORTANT !!!
// DO NOT change the order of imports
// `../../../Term/Type/kinds` is also a dependecy of `pmatch`
import { getElemAtTerm } from "../../../PTypes/PStruct/pmatch";
import { StructDefinition, isStructType, isStructDefinition, data, list, int, pair, Methods } from "../../../type_system";
import { peqData,  } from "../../builtins/data";
import { PBool } from "../../../PTypes/PBool";
import { TermBool } from "./TermBool";
import { _fromData } from "../data/conversion/fromData_minimal";
import { UtilityTermOf } from "./addUtilityForType";
import { punsafeConvertType } from "../../punsafeConvertType";
import { TermInt, addPIntMethods } from "./TermInt";
import { TermList, addPListMethods } from "./TermList";
import { hasOwn, defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import type { IsSingleKey } from "../../../../utils/IsSingleKey";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";
import { IRFunc } from "../../../../IR/IRNodes/IRFunc";
import { IRApp } from "../../../../IR/IRNodes/IRApp";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { IRVar } from "../../../../IR/IRNodes/IRVar";
import { IRLetted } from "../../../../IR/IRNodes/IRLetted";
import type { PData } from "../../../PTypes/PData";
import type { PList } from "../../../PTypes/PList";
import type { PPair } from "../../../PTypes/PPair";
import type { PInt } from "../../../PTypes/PInt";
import { FilterMethodsByInput, LiftMethods, MethodsAsTerms } from "./userMethods/methodsTypes";
import { addUserMethods } from "./userMethods/addUserMethods";
import { plet } from "../../plet";

export type RawStruct = {
    readonly index: TermInt,
    readonly fields: TermList<PData>
}

export type TermStruct<SDef extends StructDefinition, SMethods extends Methods> = Term<PStruct<SDef,SMethods>> & {

    readonly eqTerm: TermFn<[PStruct<SDef, {}>], PBool>
    readonly eq: ( other: Term<PStruct<SDef, {}>> ) => TermBool

    readonly raw: RawStruct

} & 
(
    IsSingleKey<SDef> extends true ? 
        StructInstance<SDef[keyof SDef]> & {
            /**
             * @deprecated
             */
            extract: <Fields extends (keyof SDef[keyof SDef])[]>( ...fields: Fields ) => {
                /**
                 * @deprecated
                 */
                in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<SDef[keyof SDef],Fields> ) => Term<PExprResult> ) => UtilityTermOf<PExprResult>
            }
        } : {}
) &
LiftMethods<
    FilterMethodsByInput<SMethods,PStruct<SDef, any>>
> & 
MethodsAsTerms<
    FilterMethodsByInput<SMethods,PStruct<SDef, any>>
>

const hoisted_getFields = new IRHoisted(
    new IRFunc( 1, // struct
        new IRApp(
            IRNative.sndPair,
            new IRApp(
                IRNative.unConstrData,
                new IRVar( 0 )
            )
        )
    )
);

export function addPStructMethods<
    SDef extends StructDefinition, 
    SMethods extends Methods
>( 
    struct: Term<PStruct<SDef, SMethods>> 
): TermStruct<SDef, SMethods>
{
    const t = struct.type;
    if( !isStructType(t) ) return struct as any;

    const sDef = t[1] as SDef;
    if( typeof sDef === "symbol" || !isStructDefinition( sDef ) ) return struct as any;

    const ctors = Object.keys( sDef );

    // shortcut for single ctors structs
    if( ctors.length === 1 )
    {
        const ctorName = ctors[0];
        const ctor = sDef[ ctorName ];

        const fieldsNames = Object.keys( ctor );
        const nFields = fieldsNames.length

        const letted_fieldsListData = new Term<PList<PData>>(
            list( data ),
            dbn => new IRLetted(
                Number(dbn),
                new IRApp(
                    hoisted_getFields.clone(),
                    struct.toIR( dbn )
                )
            )
        );

        for( let i = 0; i < nFields; i++ )
        {
            const thisFieldName = fieldsNames[i];
            const thisFieldType = ctor[ thisFieldName ];
            
            (
                !hasOwn( struct, thisFieldName )
            ) && Object.defineProperty(
                struct, thisFieldName,
                {
                    value: punsafeConvertType(
                        plet(
                            _fromData( thisFieldType )(
                                getElemAtTerm( i ).$( letted_fieldsListData )
                            )
                        ),
                        thisFieldType
                    ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );

        }

        /**
         * @deprecated
         */
        defineReadOnlyProperty(
            struct,
            "extract",
            <Fields extends (keyof SDef[keyof SDef])[]>( ...fields: Fields ): {
                in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<SDef[keyof SDef],Fields> ) => Term<PExprResult> ) => Term<PExprResult>
            } => {
                return {
                    in: ( expr ) => expr( struct as any )
                }
            }
        );
    }

    definePropertyIfNotPresent(
        struct, "eqTerm",
        {
            get: () => plet( peqData.$( struct as any ) ),
            set: () => {},
            configurable: false,
            enumerable: true 
        }
    )

    defineReadOnlyProperty(
        struct, "eq", ( other: Term<PStruct<SDef, SMethods>> ) => peqData.$( struct as any ).$( other as any )
    )

    const letted_unconstred = new Term<PPair<PInt,PList<PData>>>(
        pair( int, list( data )),
        dbn => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.unConstrData,
                struct.toIR( dbn )
            )
        )
    );

    const letted_ctorIdx = new Term<PInt>(
        int,
        dbn => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.fstPair,
                letted_unconstred.toIR( dbn )
            )
        )
    );

    const letted_rawFields = new Term<PList<PData>>(
        list( data ),
        dbn => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.sndPair,
                letted_unconstred.toIR( dbn )
            )
        )
    );

    defineReadOnlyProperty(
        struct, "raw",
        Object.freeze({
            index:  addPIntMethods( letted_ctorIdx ),
            fields: addPListMethods( letted_rawFields )
        })
    );

    struct = addUserMethods( struct, t[2] )

    return struct as any;
}