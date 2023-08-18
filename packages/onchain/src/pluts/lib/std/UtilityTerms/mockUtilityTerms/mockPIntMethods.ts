import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { TermInt } from "../TermInt";
import { bool, int, lam } from "../../../../type_system";
import { makeMockTerm } from "./makeMockTerm";
import { Term } from "../../../../Term";
import { PInt } from "../../../../PTypes/PInt";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { makeMockTermBool } from "./mockPBoolMethods";


const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function makeMockTermInt(): TermInt
{
    return mockPIntMethods( makeMockTerm( int ) );
}

export function mockPIntMethods( term: Term<PInt> ): TermInt
{
    definePropertyIfNotPresent(
        term,
        "addTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "add",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "subTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "sub",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "multTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "mult",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "divTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "div",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "quotTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "quot",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "remainderTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "remainder",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "modTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, int ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "mod",
        ( other: Term<PInt> ): TermInt => makeMockTermInt()
    );


    definePropertyIfNotPresent(
        term,
        "eqTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PInt> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "ltTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PInt> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "ltEqTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PInt> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "gtTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PInt> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "gtEqTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PInt> ) => makeMockTermBool()
    );


    return term as any;
}

