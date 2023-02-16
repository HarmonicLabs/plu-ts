import ObjectUtils from "../../../../../utils/ObjectUtils"
import { PByteString, TermFn, PInt, PBool } from "../../../PTypes"
import { Term } from "../../../Term"
import { bs, int } from "../../../type_system/types"
import { flippedCons, pappendBs, pconsBs, peqBs, pgreaterBS, pgreaterEqBS, pindexBs, plengthBs, plessBs, plessEqBs, psliceBs } from "../../builtins/bs"
import { psub } from "../../builtins/int/psub"
import { pdecodeUtf8 } from "../../builtins/str"
import { PappArg } from "../../pappArg"
import { pfn } from "../../pfn"
import { phoist } from "../../phoist"
import { TermBool } from "./TermBool"
import { TermInt } from "./TermInt"
import { TermStr } from "./TermStr"



export type TermBS = Term<PByteString> & {

    readonly length: TermInt
    
    readonly utf8Decoded: TermStr
    
    // pappendBs
    readonly concatTerm: TermFn<[PByteString], PByteString>
    readonly concat: ( other: PappArg<PByteString>) => TermBS

    // pconsBs
    readonly prependTerm: TermFn<[PInt], PByteString>
    readonly prepend: ( byte: PappArg<PInt> ) => TermBS

    // psliceBs
    readonly subByteStringTerm: TermFn<[PInt, PInt], PByteString>
    readonly subByteString: ( fromInclusive: PappArg<PInt>, ofLength: PappArg<PInt> ) => TermBS
    
    readonly sliceTerm: TermFn<[PInt, PInt], PByteString>
    readonly slice:     ( fromInclusive: PappArg<PInt>, toExclusive: PappArg<PInt> ) => TermBS
    
    // pindexBs
    readonly atTerm:    TermFn<[PInt], PInt>
    readonly at:        ( index: PappArg<PInt> ) => TermInt

    readonly eqTerm:    TermFn<[PByteString], PBool>
    readonly eq:        ( other: PappArg<PByteString> ) => TermBool

    readonly ltTerm:    TermFn<[PByteString], PBool>
    readonly lt:        ( other: PappArg<PByteString> ) => TermBool

    readonly ltEqTerm:  TermFn<[PByteString], PBool>
    readonly ltEq:      ( other: PappArg<PByteString> ) => TermBool

    readonly gtTerm:    TermFn<[PByteString], PBool>
    readonly gt:        ( other: PappArg<PByteString> ) => TermBool

    readonly gtEqTerm:  TermFn<[PByteString], PBool>
    readonly gtEq:      ( other: PappArg<PByteString> ) => TermBool

}

const subByteString = phoist(
    pfn([
        bs,
        int,
        int
    ],  bs)
    (( term, fromInclusive , ofLength ): TermBS =>
        psliceBs.$( fromInclusive ).$( ofLength ).$( term )
    )
)

const jsLikeSlice = phoist(
    pfn([
        bs,
        int,
        int
    ],  bs)
    (( term, fromInclusive , toExclusive ): TermBS =>
        psliceBs.$( fromInclusive ).$( psub.$( toExclusive ).$( fromInclusive ) ).$( term )
    )
);

export function addPByteStringMethods( term: Term<PByteString> ): TermBS
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "length",
        plengthBs.$( term )
    );
    ObjectUtils.definePropertyIfNotPresent(
        term,
        "utf8Decoded",
        {
            get: () => pdecodeUtf8.$( term ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "concatTerm",
        pappendBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        ( other: PappArg<PByteString>): TermBS => pappendBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "prependTerm",
        flippedCons.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "prepend",
        ( byte: PappArg<PInt>): TermBS => pconsBs.$( byte ).$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteStringTerm",
        subByteString.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteString",
        ( fromInclusive: PappArg<PInt>, ofLength: PappArg<PInt> ): TermBS => psliceBs.$( fromInclusive ).$( ofLength ).$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "sliceTerm",
        jsLikeSlice.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "slice",
        ( fromInclusive: PappArg<PInt>, toExclusive: PappArg<PInt> ): TermBS => jsLikeSlice.$( term ).$( fromInclusive ).$( toExclusive )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "atTerm",
        pindexBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "at",
        ( index: PappArg<PInt> ): TermInt => pindexBs.$( term ).$( index )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        peqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PByteString> ): TermBool => peqBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltTerm",
        plessBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: PappArg<PByteString> ): TermBool => plessBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEqTerm",
        plessEqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: PappArg<PByteString> ): TermBool => plessEqBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtTerm",
        pgreaterBS.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: PappArg<PByteString> ): TermBool => pgreaterBS.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEqTerm",
        pgreaterEqBS.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: PappArg<PByteString> ): TermBool => pgreaterEqBS.$( term ).$( other )
    );


    return term as any;
}