import { flippedCons, pappendBs, pconsBs, pdecodeUtf8, peqBs, pgreaterBS, pgreaterEqBS, pindexBs, plengthBs, plessBs, plessEqBs, psliceBs, psub } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PByteString from "../../PTypes/PByteString";
import PInt from "../../PTypes/PInt";
import Term from "../../Term";
import TermInt from "./TermInt";
import TermStr from "./TermStr";
import { TermFn } from "../../PTypes/PFn/PLam";
import PBool from "../../PTypes/PBool";
import { pfn, phoist } from "../../Syntax/syntax";
import { bs, fn, int } from "../../Term/Type/base";
import TermBool from "./TermBool";
import { pflip } from "../PCombinators";
import HoistedUPLC from "../../../UPLC/UPLCTerms/HoistedUPLC";
import Application from "../../../UPLC/UPLCTerms/Application";
import Lambda from "../../../UPLC/UPLCTerms/Lambda";
import UPLCVar from "../../../UPLC/UPLCTerms/UPLCVar";
import Builtin from "../../../UPLC/UPLCTerms/Builtin";

type TermBS = Term<PByteString> 
& {
    readonly length: TermInt
    
    readonly utf8Decoded: TermStr
    
    // pappendBs
    readonly concatTerm: TermFn<[PByteString], PByteString>
    readonly concat: ( other: Term<PByteString>) => TermBS

    // pconsBs
    readonly prependTerm: TermFn<[PInt], PByteString>
    readonly prepend: ( byte: Term<PInt> ) => TermBS

    // psliceBs
    readonly subByteStringTerm: TermFn<[PInt, PInt], PByteString>
    readonly subByteString: ( fromInclusive: Term<PInt>, ofLength: Term<PInt> ) => TermBS
    
    readonly sliceTerm: TermFn<[PInt, PInt], PByteString>
    readonly slice:     ( fromInclusive: Term<PInt>, toExclusive: Term<PInt> ) => TermBS
    
    // pindexBs
    readonly atTerm:    TermFn<[PInt], PInt>
    readonly at:        ( index: Term<PInt> ) => TermInt

    readonly eqTerm:    TermFn<[PByteString], PBool>
    readonly eq:        ( other: Term<PByteString> ) => TermBool

    readonly ltTerm:    TermFn<[PByteString], PBool>
    readonly lt:        ( other: Term<PByteString> ) => TermBool

    readonly ltEqTerm:  TermFn<[PByteString], PBool>
    readonly ltEq:      ( other: Term<PByteString> ) => TermBool

    readonly gtTerm:    TermFn<[PByteString], PBool>
    readonly gt:        ( other: Term<PByteString> ) => TermBool

    readonly gtEqTerm:  TermFn<[PByteString], PBool>
    readonly gtEq:      ( other: Term<PByteString> ) => TermBool

}

export default TermBS;

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
        ( other: Term<PByteString>): TermBS => pappendBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "prependTerm",
        flippedCons.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "prepend",
        ( byte: Term<PInt>): TermBS => pconsBs.$( byte ).$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteStringTerm",
        subByteString.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteString",
        ( fromInclusive: Term<PInt>, ofLength: Term<PInt> ): TermBS => psliceBs.$( fromInclusive ).$( ofLength ).$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "sliceTerm",
        jsLikeSlice.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "slice",
        ( fromInclusive: Term<PInt>, toExclusive: Term<PInt> ): TermBS => jsLikeSlice.$( term ).$( fromInclusive ).$( toExclusive )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "atTerm",
        pindexBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "at",
        ( index: Term<PInt> ): TermInt => pindexBs.$( term ).$( index )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        peqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PByteString> ): TermBool => peqBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltTerm",
        plessBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PByteString> ): TermBool => plessBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEqTerm",
        plessEqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PByteString> ): TermBool => plessEqBs.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtTerm",
        pgreaterBS.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PByteString> ): TermBool => pgreaterBS.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEqTerm",
        pgreaterEqBS.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PByteString> ): TermBool => pgreaterEqBS.$( term ).$( other )
    );


    return term as any;
}