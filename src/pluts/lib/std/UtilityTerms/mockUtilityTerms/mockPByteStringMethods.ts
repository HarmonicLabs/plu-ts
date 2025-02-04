import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { PByteString } from "../../../../PTypes/PByteString";
import { Term } from "../../../../Term";
import { TermBS } from "../TermBS";
import { makeMockTerm } from "./makeMockTerm";
import { bool, bs, int, lam, str } from "../../../../../type_system/types";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { makeMockTermBool } from "./mockPBoolMethods";
import { makeMockTermInt } from "./mockPIntMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function makeMockTermBs(): TermBS
{
    return mockPByteStringMethods( makeMockTerm( bs ) );
}

export function mockPByteStringMethods( term: Term<PByteString> ): TermBS
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "length",
        {
            get: () => makeMockUtilityTerm( int ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        term,
        "utf8Decoded",
        {
            get: () => makeMockUtilityTerm( str ),
            ...getterOnly
        }
    );

    definePropertyIfNotPresent(
        term,
        "pconcat",
        {
            get: () => makeMockUtilityTerm( lam( bs, bs ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "concat",
        ( other: any ): TermBS => makeMockTermBs()
    );

    definePropertyIfNotPresent(
        term,
        "pprepend",
        {
            get: () => makeMockUtilityTerm( lam( int, bs ) ), 
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "prepend",
        ( byte: any ): TermBS => makeMockTermBs()
    );

    definePropertyIfNotPresent(
        term,
        "psubByteString",
        {
            get: () => makeMockUtilityTerm( lam( int, lam( int, bs ) ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "subByteString",
        ( fromInclusive: any, ofLength: any ): TermBS => makeMockTermBs()
    );

    definePropertyIfNotPresent(
        term,
        "pslice",
        {
            get: () => makeMockUtilityTerm( lam( int, lam( int, bs ) ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "slice",
        ( fromInclusive: any, toExclusive: any): TermBS => makeMockTermBs()
    );

    definePropertyIfNotPresent(
        term,
        "pat",
        {
            get: () => makeMockUtilityTerm( lam( int, bs ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "at",
        ( index: any) /*: TermInt*/ => makeMockTermInt()
    );

    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => makeMockUtilityTerm( lam( bs, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PByteString> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "plt",
        {
            get: () => makeMockUtilityTerm( lam( bs, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PByteString> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "pltEq",
        {
            get: () => makeMockUtilityTerm( lam( bs, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PByteString> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "pgt",
        {
            get: () => makeMockUtilityTerm( lam( bs, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PByteString> ) => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        term,
        "pgtEq",
        {
            get: () => makeMockUtilityTerm( lam( bs, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PByteString> ) => makeMockTermBool()
    );


    return term as any;
}