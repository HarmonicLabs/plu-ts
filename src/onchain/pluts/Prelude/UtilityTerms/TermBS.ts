import { pappendBs, pdecodeUtf8, peqBs, pgreaterBS, pgreaterEqBS, pindexBs, plengthBs, plessBs, plessEqBs, psliceBs, psub } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PByteString from "../../PTypes/PByteString";
import PInt from "../../PTypes/PInt";
import Term from "../../Term";
import TermBool from "./TermBool";
import TermInt from "./TermInt";
import TermStr from "./TermStr";

type TermBS = Term<PByteString> 
& {
    readonly length: TermInt
    
    // pappendBs
    concat: ( byteStr: Term<PByteString> ) => TermBS
    // pconsBs
    prepend: ( byte: Term<PInt> ) => TermBS
    // psliceBs
    subByteString: ( fromInclusive: Term<PInt>, ofLength: Term<PInt> ) => TermBS
    slice: ( fromInclusive: Term<PInt>, toExclusive: Term<PInt> ) => TermBS
    // pindexBs
    at: ( index: Term<PInt> ) => TermInt

    // pencodeUtf8
    toUtf8String: () => TermStr

    eq: ( other: Term<PByteString> ) => TermBool
    lt: ( other: Term<PByteString> ) => TermBool
    ltEq: ( other: Term<PByteString> ) => TermBool
    gt: ( other: Term<PByteString> ) => TermBool
    gtEq: ( other: Term<PByteString> ) => TermBool
}

export default TermBS;

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
        ( other: Term<PByteString> ) => pappendBs.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "subByteString",
        ( fromInclusive: Term<PInt>, ofLength: Term<PInt> ): TermBS => psliceBs.$( fromInclusive ).$( ofLength ).$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "slice",
        ( fromInclusive: Term<PInt>, toExclusive: Term<PInt> ): TermBS =>
            psliceBs.$( fromInclusive ).$( psub.$( toExclusive ).$( fromInclusive ) ).$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "at",
        ( index: Term<PInt> ): TermInt => pindexBs.$( term ).$( index )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "toUtf8Stringf",
        (): TermStr => pdecodeUtf8.$( term )
    )

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PByteString> ): TermBool => peqBs.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PByteString> ): TermBool => plessBs.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PByteString> ): TermBool => plessEqBs.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PByteString> ): TermBool => pgreaterBS.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PByteString> ): TermBool => pgreaterEqBS.$( term ).$( other )
    );

    return term as any;
}