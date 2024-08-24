import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { PByteString, TermFn, PInt, PBool } from "../../../PTypes"
import { Term } from "../../../Term"
import { flippedCons, jsLikeSlice, pappendBs, pconsBs, peqBs, pgreaterBS, pgreaterEqBS, pindexBs, plengthBs, plessBs, plessEqBs, psliceBs, subByteString } from "../../builtins/bs"
import { pdecodeUtf8 } from "../../builtins/str"
import { PappArg } from "../../pappArg"
import { plet } from "../../plet"
import { TermBool } from "./TermBool"
import { TermInt } from "./TermInt"
import { TermStr } from "./TermStr"
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm"



export type TermBS = Term<PByteString> & BaseUtilityTermExtension & {

    readonly length: TermInt
    
    readonly utf8Decoded: TermStr
    
    // pappendBs
    readonly pconcat: TermFn<[PByteString], PByteString>
    readonly concat: ( other: PappArg<PByteString>) => TermBS

    // pconsBs
    readonly pprepend: TermFn<[PInt], PByteString>
    readonly prepend: ( byte: PappArg<PInt> ) => TermBS

    // psliceBs
    readonly psubByteString: TermFn<[PInt, PInt], PByteString>
    readonly subByteString: ( fromInclusive: PappArg<PInt>, ofLength: PappArg<PInt> ) => TermBS
    
    readonly pslice: TermFn<[PInt, PInt], PByteString>
    readonly slice:     ( fromInclusive: PappArg<PInt>, toExclusive: PappArg<PInt> ) => TermBS
    
    // pindexBs
    readonly pat:    TermFn<[PInt], PInt>
    readonly at:        ( index: PappArg<PInt> ) => TermInt

    readonly peq:    TermFn<[PByteString], PBool>
    readonly eq:        ( other: PappArg<PByteString> ) => TermBool

    readonly plt:    TermFn<[PByteString], PBool>
    readonly lt:        ( other: PappArg<PByteString> ) => TermBool

    readonly pltEq:  TermFn<[PByteString], PBool>
    readonly ltEq:      ( other: PappArg<PByteString> ) => TermBool

    readonly pgt:    TermFn<[PByteString], PBool>
    readonly gt:        ( other: PappArg<PByteString> ) => TermBool

    readonly pgtEq:  TermFn<[PByteString], PBool>
    readonly gtEq:      ( other: PappArg<PByteString> ) => TermBool

}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPByteStringMethods( term: Term<PByteString> ): TermBS
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "length",
        {
            get: () => plet( plengthBs.$( term ) ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        term,
        "utf8Decoded",
        {
            get: () => plet( pdecodeUtf8.$( term ) ),
            ...getterOnly
        }
    );

    definePropertyIfNotPresent(
        term,
        "pconcat",
        {
            get: () => pappendBs.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "concat",
        ( other: PappArg<PByteString>): TermBS => pappendBs.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pprepend",
        {
            get: () => flippedCons.$( term ), 
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "prepend",
        ( byte: PappArg<PInt>): TermBS => pconsBs.$( byte ).$( term )
    );

    definePropertyIfNotPresent(
        term,
        "psubByteString",
        {
            get: () => subByteString.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "subByteString",
        ( fromInclusive: PappArg<PInt>, ofLength: PappArg<PInt> ): TermBS => psliceBs.$( fromInclusive ).$( ofLength ).$( term )
    );

    definePropertyIfNotPresent(
        term,
        "pslice",
        {
            get: () => jsLikeSlice.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "slice",
        ( fromInclusive: PappArg<PInt>, toExclusive: PappArg<PInt> ): TermBS => jsLikeSlice.$( term ).$( fromInclusive ).$( toExclusive )
    );

    definePropertyIfNotPresent(
        term,
        "pat",
        {
            get: () => pindexBs.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "at",
        ( index: PappArg<PInt> ): TermInt => pindexBs.$( term ).$( index )
    );

    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => peqBs.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PByteString> ): TermBool => peqBs.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "plt",
        {
            get: () => plessBs.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "lt",
        ( other: PappArg<PByteString> ): TermBool => plessBs.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pltEq",
        {
            get: () => plessEqBs.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: PappArg<PByteString> ): TermBool => plessEqBs.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pgt",
        {
            get: () => pgreaterBS.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gt",
        ( other: PappArg<PByteString> ): TermBool => pgreaterBS.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pgtEq",
        {
            get: () => pgreaterEqBS.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: PappArg<PByteString> ): TermBool => pgreaterEqBS.$( term ).$( other )
    );


    return term as any;
}