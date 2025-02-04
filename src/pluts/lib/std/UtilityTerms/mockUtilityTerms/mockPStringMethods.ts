import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PString } from "../../../../PTypes/PString";
import { Term } from "../../../../Term";
import { TermStr } from "../TermStr";
import { makeMockTermBs } from "./mockPByteStringMethods";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { bool, lam, str } from "../../../../../type_system";
import { makeMockTerm } from "./makeMockTerm";
import { makeMockTermBool } from "./mockPBoolMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function makeMockTermStr(): TermStr
{
    return mockPStringMethods( makeMockTerm( str ) );
}


export function mockPStringMethods( term: Term<PString> ): TermStr
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "utf8Encoded",
        {
            get: () => makeMockTermBs(),
            ...getterOnly
        }
    );

    definePropertyIfNotPresent(
        term,
        "pconcat",
        {
            get: () => makeMockUtilityTerm( lam( str, str ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "concat",
        ( other: Term<PString> ) => makeMockTermStr()
    );

    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => makeMockUtilityTerm( lam( str, bool ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PString> ) => makeMockTermBool()
    );

    return term as any;
}