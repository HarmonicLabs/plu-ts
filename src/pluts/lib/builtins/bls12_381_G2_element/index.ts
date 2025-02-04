import { PBlsG2 } from "../../../PTypes/PBlsG2";
import { blsG2, bool, bs, fn, int } from "../../../../type_system/types";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { Term } from "../../../Term";
import { PFn } from "../../../PTypes/PFn/PFn";
import { PInt } from "../../../PTypes/PInt";
import type { PByteString } from "../../../PTypes/PByteString";
import { PBool } from "../../../PTypes/PBool";
import { addApplications } from "../addApplications";

export const bls12_381_G2_element_add = addApplications<[ PBlsG2, PBlsG2 ], PBlsG2>(
    new Term(
        fn([ blsG2, blsG2 ], blsG2 ),
        _dbn => {
            return IRNative.bls12_381_G2_add;
        }
    )
);

export const bls12_381_G2_element_neg = addApplications<[ PBlsG2 ], PBlsG2>(
    new Term(
        fn([ blsG2 ], blsG2 ),
        _dbn => {
            return IRNative.bls12_381_G2_neg;
        }
    )
);

export const bls12_381_G2_element_scalarMul = addApplications<[ PInt, PBlsG2 ], PBlsG2>(
    new Term(
        fn([ int, blsG2 ], blsG2 ),
        _dbn => {
            return IRNative.bls12_381_G2_scalarMul;
        }
    )
);

export const bls12_381_G2_element_eq = addApplications<[ PBlsG2, PBlsG2 ], PBool>(
    new Term(
        fn([ blsG2, blsG2 ], bool ),
        _dbn => {
            return IRNative.bls12_381_G2_equal;
        }
    )
);

export const bls12_381_G2_element_hashToGroup = addApplications<[ PByteString, PByteString ], PBlsG2>(
    new Term(
        fn([ bs, bs ], blsG2 ),
        _dbn => {
            return IRNative.bls12_381_G2_hashToGroup;
        }
    )
);

export const bls12_381_G2_element_compress = addApplications<[ PBlsG2 ], PByteString>(
    new Term(
        fn([ blsG2 ], bs ),
        _dbn => {
            return IRNative.bls12_381_G2_compress;
        }
    )
);

export const bls12_381_G2_element_uncompress = addApplications<[ PByteString ], PBlsG2>(
    new Term(
        fn([ bs ], blsG2 ),
        _dbn => {
            return IRNative.bls12_381_G2_uncompress;
        }
    )
);