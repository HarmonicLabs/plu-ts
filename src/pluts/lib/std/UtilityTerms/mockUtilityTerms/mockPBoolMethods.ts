import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { makeMockTerm } from "./makeMockTerm"
import { TermBool } from "../TermBool";
import { Term } from "../../../../Term";
import { PBool } from "../../../../PTypes/PBool";
import { bool, delayed, lam } from "../../../../../type_system/types";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";


// export type TermBool = Term<PBool> & {
// 
//     readonly por:            TermFn<[ PDelayed<PBool> ], PBool>
//     readonly or:                ( other: PappArg<PBool> ) => TermBool
// 
//     readonly pstrictOr:      TermFn<[ PBool ], PBool>
//     readonly strictOr:          ( other: PappArg<PBool> ) => TermBool
// 
//     readonly pand:           TermFn<[ PDelayed<PBool> ], PBool>
//     readonly and:               ( other: PappArg<PBool> ) => TermBool
// 
//     readonly pstrictAnd:     TermFn<[ PBool ], PBool>
//     readonly strictAnd:         ( other: PappArg<PBool> ) => TermBool
// 
// }

export function makeMockTermBool(): TermBool
{
    return mockPBoolMethods( makeMockTerm( bool ) );
}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function mockPBoolMethods( term: Term<PBool> ): TermBool
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "por",
        {
            get: () => makeMockTerm( lam( delayed( bool ), bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "or",
        ( other: Term<PBool> | boolean ): TermBool => mockPBoolMethods( makeMockTerm( bool ) )
    );

    definePropertyIfNotPresent(
        term,
        "pstrictOr",
        {
            get: () => makeMockTerm( lam( bool, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "strictOr",
        ( other: any ): TermBool => mockPBoolMethods( makeMockTerm( bool ) )
    );


    definePropertyIfNotPresent(
        term,
        "pand",
        {
            get: () => makeMockTerm( lam( delayed( bool ), bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "and",
        ( other: Term<PBool> | boolean ): TermBool => mockPBoolMethods( makeMockTerm( bool ) )
    );

    definePropertyIfNotPresent(
        term,
        "pstrictAnd",
        {
            get: () => makeMockTerm( lam( bool, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "strictAnd",
        ( other: any ): TermBool => mockPBoolMethods( makeMockTerm( bool ) )
    );

    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => makeMockUtilityTerm( lam( bool, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: any ): TermBool => makeMockTermBool()
    );

    return term as any;
}