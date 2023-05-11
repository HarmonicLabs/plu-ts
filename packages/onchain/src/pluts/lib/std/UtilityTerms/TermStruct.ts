import { Term } from "../../../Term";
import type { PStruct, RestrictedStructInstance, StructInstance } from "../../../PTypes/PStruct/pstruct";
import type { PType } from "../../../PType";
// !!! IMPORTANT !!!
// DO NOT change the order of imports
// `../../../Term/Type/kinds` is also a dependecy of `pmatch`
import { getElemAtTerm, pmatch } from "../../../PTypes/PStruct/pmatch";
import { StructDefinition, isStructType, isStructDefinition, data, list, int, pair } from "../../../type_system";
import { peqData, punConstrData } from "../../builtins/data";
import { TermFn } from "../../../PTypes/PFn/PFn";
import { PBool } from "../../../PTypes/PBool";
import { TermBool } from "./TermBool";
import { PData, PInt, PList, PPair } from "../../../PTypes";
import { _plet } from "../../plet/minimal";
import { _fromData } from "../data/conversion/fromData_minimal";
import { plet } from "../../plet";
import { IRApp, IRFunc, IRHoisted, IRLetted, IRNative, IRVar } from "../../../../IR";
import { UtilityTermOf } from "../../addUtilityForType";
import { punsafeConvertType } from "../../punsafeConvertType";
import { TermInt, addPIntMethods } from "./TermInt";
import { TermList, addPListMethods } from "./TermList";
import { hasOwn, defineReadOnlyProperty, definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import type { IsSingleKey } from "../../../../utils/IsSingleKey";

export type RawStruct = {
    readonly index: TermInt,
    readonly fields: TermList<PData>
}

export type TermStruct<SDef extends StructDefinition> = Term<PStruct<SDef>> & {

    readonly eqTerm: TermFn<[PStruct<SDef>], PBool>
    readonly eq: ( other: Term<PStruct<SDef>> ) => TermBool

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
);

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

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
        struct, "eq", ( other: Term<PStruct<SDef>> ) => peqData.$( struct as any ).$( other as any )
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

    return struct as any;
}