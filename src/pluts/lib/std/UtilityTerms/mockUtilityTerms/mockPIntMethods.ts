import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { TermInt } from "../TermInt";
import { bool, int, lam } from "../../../../../type_system";
import { makeMockTerm } from "./makeMockTerm";
import { Term } from "../../../../Term";
import { PInt } from "../../../../PTypes/PInt";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { makeMockTermBool } from "./mockPBoolMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";


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
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "padd",
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
        "psub",
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
        "pmult",
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
        "pdiv",
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
        "pquot",
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
        "premainder",
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
        "pmod",
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
        "peq",
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
        "plt",
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
        "pltEq",
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
        "pgt",
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
        "pgtEq",
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

