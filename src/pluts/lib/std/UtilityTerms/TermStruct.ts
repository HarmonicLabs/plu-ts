import { Term } from "../../../Term";
import type { PStruct, StructInstance } from "../../../PTypes/PStruct/pstruct";
import type { TermFn } from "../../../PTypes/PFn/PFn";
import { StructDefinition, isStructType, isStructDefinition, data, list, int, pair, Methods, termTypeToString } from "../../../../type_system";
import { peqData,  } from "../../builtins/data";
import { PBool } from "../../../PTypes/PBool";
import { TermBool } from "./TermBool";
import { _fromData } from "../data/conversion/fromData_minimal";
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
import { _getMinUnboundDbn } from "../../../../IR/toUPLC/subRoutines/handleLetted/groupByScope";
import { getElemAtTerm } from "../../pmatch/getElemAtTerm";
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm";

export type RawStruct = {
    readonly index: TermInt,
    readonly fields: TermList<PData>
}

export type TermStruct<SDef extends StructDefinition, SMethods extends Methods> = Term<PStruct<SDef,SMethods>> & BaseUtilityTermExtension & {

    readonly peq: TermFn<[PStruct<SDef, {}>], PBool>
    readonly eq: ( other: Term<PStruct<SDef, {}>> | Term<PData> ) => TermBool

    readonly raw: RawStruct
  
} & 
(
    IsSingleKey<SDef> extends true ? 
        StructInstance<SDef[keyof SDef]> : {}
) &
LiftMethods<
    FilterMethodsByInput<SMethods,PStruct<SDef, {}>>
> & 
MethodsAsTerms<
    FilterMethodsByInput<SMethods,PStruct<SDef, {}>>
>

const hoisted_getFields = new IRHoisted(
    new IRFunc( 1, // struct
        new IRApp(
            IRNative.sndPair,
            new IRApp(
                IRNative.unConstrData,
                new IRVar( 0 )
            )
        ),
        "hoisted_getFields"
    )
);
hoisted_getFields.hash;

export function addPStructMethods<
    SDef extends StructDefinition, 
    SMethods extends Methods
>( 
    struct: Term<PStruct<SDef, SMethods>> 
): TermStruct<SDef, SMethods>
{
    struct = addBaseUtilityTerm( struct );

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
            (cfg, dbn) => new IRLetted(
                Number(dbn),
                new IRApp(
                    hoisted_getFields.clone(),
                    struct.toIR( cfg, dbn )
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
                            ),
                            ctorName + "::" + thisFieldName
                        ),
                        thisFieldType
                    ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        }
    }

    definePropertyIfNotPresent(
        struct, "peq",
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
        (cfg, dbn) => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.unConstrData,
                struct.toIR( cfg, dbn )
            )
        )
    );

    const letted_ctorIdx = new Term<PInt>(
        int,
        (cfg, dbn) => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.fstPair,
                letted_unconstred.toIR( cfg, dbn )
            )
        )
    );

    const letted_rawFields = new Term<PList<PData>>(
        list( data ),
        (cfg, dbn) => new IRLetted(
            Number(dbn),
            new IRApp(
                IRNative.sndPair,
                letted_unconstred.toIR( cfg, dbn )
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