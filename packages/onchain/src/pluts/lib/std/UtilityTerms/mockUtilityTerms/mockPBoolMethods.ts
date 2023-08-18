import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { makeMockTerm } from "./makeMockTerm"
import { TermBool } from "../TermBool";
import { Term } from "../../../../Term";
import { PBool } from "../../../../PTypes/PBool";
import { bool, delayed, lam } from "../../../../type_system/types";


// export type TermBool = Term<PBool> & {
// 
//     readonly orTerm:            TermFn<[ PDelayed<PBool> ], PBool>
//     readonly or:                ( other: PappArg<PBool> ) => TermBool
// 
//     readonly strictOrTerm:      TermFn<[ PBool ], PBool>
//     readonly strictOr:          ( other: PappArg<PBool> ) => TermBool
// 
//     readonly andTerm:           TermFn<[ PDelayed<PBool> ], PBool>
//     readonly and:               ( other: PappArg<PBool> ) => TermBool
// 
//     readonly strictAndTerm:     TermFn<[ PBool ], PBool>
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
    definePropertyIfNotPresent(
        term,
        "orTerm",
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
        "strictOrTerm",
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
        "andTerm",
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
        "strictAndTerm",
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

    return term as any;
}