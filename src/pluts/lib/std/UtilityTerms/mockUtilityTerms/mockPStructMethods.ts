import { definePropertyIfNotPresent, defineReadOnlyProperty, hasOwn } from "@harmoniclabs/obj-utils";
import { PStruct } from "../../../../PTypes/PStruct/pstruct";
import { Term } from "../../../../Term";
import { isStructDefinition, isStructType } from "../../../../../type_system/kinds/isWellFormedType";
import { Methods, StructDefinition, bool, data, int, lam, list, pair } from "../../../../../type_system/types";
import { TermStruct } from "../TermStruct";
import { makeMockTerm } from "./makeMockTerm";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { PType } from "../../../../PType";
import { makeMockTermBool } from "./mockPBoolMethods";
import { mockPIntMethods } from "./mockPIntMethods";
import { mockPListMethods } from "./mockPListMethods";
import { mockUserMethods } from "./mockUserMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";


export function mockPStructMethods<
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

        const letted_fieldsListData = makeMockTerm( list( data ) );

        for( let i = 0; i < nFields; i++ )
        {
            const thisFieldName = fieldsNames[i];
            const thisFieldType = ctor[ thisFieldName ];
            
            (
                !hasOwn( struct, thisFieldName )
            ) && Object.defineProperty(
                struct, thisFieldName,
                {
                    value: makeMockUtilityTerm( thisFieldType ),
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
            get: () => makeMockUtilityTerm( lam( data, bool ) ),
            set: () => {},
            configurable: false,
            enumerable: true 
        }
    )

    defineReadOnlyProperty(
        struct, "eq", ( other: Term<PStruct<SDef, SMethods>> ) => makeMockTermBool()
    )

    // const letted_unconstred = makeMockTerm( pair( int, list( data ) ) );

    const letted_ctorIdx = makeMockTerm( int );

    const letted_rawFields = makeMockTerm( list( data ) );

    defineReadOnlyProperty(
        struct, "raw",
        Object.freeze({
            index:  mockPIntMethods( letted_ctorIdx ),
            fields: mockPListMethods( letted_rawFields )
        })
    );

    struct = mockUserMethods( struct, t[2] )

    return struct as any;
}