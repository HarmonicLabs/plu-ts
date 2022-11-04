import { pappendBs, pdecodeUtf8, peqBs, pgreaterBS, pgreaterEqBS, pindexBs, plengthBs, plessBs, plessEqBs, psliceBs, psub } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PByteString from "../../PTypes/PByteString";
import PInt from "../../PTypes/PInt";
import Term from "../../Term";
import TermBool from "./TermBool";
import TermInt from "./TermInt";
import TermStr from "./TermStr";
import { TermFn } from "../../PTypes/PFn/PLam";
import PBool from "../../PTypes/PBool";
import { pfn, phoist } from "../../Syntax";
import { bs, int } from "../../Term/Type";

type TermBS = Term<PByteString> 
& {
    readonly length: TermInt
    
    // pappendBs
    readonly concat: TermFn<[PByteString], PByteString>
    // pconsBs
    readonly prepend: TermFn<[PInt], PByteString>
    // psliceBs
    readonly subByteString: TermFn<[PInt, PInt], PByteString>
    readonly slice: TermFn<[PInt, PInt], PByteString>
    // pindexBs
    readonly at: TermFn<[PInt], PInt>

    readonly utf8Decoded: TermStr

    readonly eq:    TermFn<[PByteString], PBool>
    readonly lt:    TermFn<[PByteString], PBool>
    readonly ltEq:  TermFn<[PByteString], PBool>
    readonly gt:    TermFn<[PByteString], PBool>
    readonly gtEq:  TermFn<[PByteString], PBool>
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
)

export function addPByteStringMethods( term: Term<PByteString> ): TermBS
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "length",
        plengthBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        pappendBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteString",
        subByteString.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "slice",
        jsLikeSlice.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "at",
        pindexBs.$( term )
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
    )

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        peqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        plessBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        plessEqBs.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        pgreaterBS.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        pgreaterEqBS.$( term )
    );

    return term as any;
}