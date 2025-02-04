import { PBlsG1 } from "../../../PTypes/PBlsG1";
import { blsG1, bool, bs, fn, int } from "../../../../type_system/types";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { Term } from "../../../Term";
import { PInt } from "../../../PTypes/PInt";
import type { PByteString } from "../../../PTypes/PByteString";
import { PBool } from "../../../PTypes/PBool";
import { addApplications } from "../addApplications";

export const bls12_381_G1_element_add = addApplications<[ PBlsG1, PBlsG1 ], PBlsG1>(
    new Term(
        fn([ blsG1, blsG1 ], blsG1 ),
        _dbn => {
            return IRNative.bls12_381_G1_add;
        }
    )
);

export const bls12_381_G1_element_neg = addApplications<[ PBlsG1 ], PBlsG1>(
    new Term(
        fn([ blsG1 ], blsG1 ),
        _dbn => {
            return IRNative.bls12_381_G1_neg;
        }
    )
);

export const bls12_381_G1_element_scalarMul = addApplications<[ PInt, PBlsG1 ], PBlsG1>(
    new Term(
        fn([ int, blsG1 ], blsG1 ),
        _dbn => {
            return IRNative.bls12_381_G1_scalarMul;
        }
    )
);

export const bls12_381_G1_element_eq = addApplications<[ PBlsG1, PBlsG1 ], PBool>(
    new Term(
        fn([ blsG1, blsG1 ], bool ),
        _dbn => {
            return IRNative.bls12_381_G1_equal;
        }
    )
);

export const bls12_381_G1_element_hashToGroup = addApplications<[ PByteString, PByteString ], PBlsG1>(
    new Term(
        fn([ bs, bs ], blsG1 ),
        _dbn => {
            return IRNative.bls12_381_G1_hashToGroup;
        }
    )
);

export const bls12_381_G1_element_compress = addApplications<[ PBlsG1 ], PByteString>(
    new Term(
        fn([ blsG1 ], bs ),
        _dbn => {
            return IRNative.bls12_381_G1_compress;
        }
    )
);

export const bls12_381_G1_element_uncompress = addApplications<[ PByteString ], PBlsG1>(
    new Term(
        fn([ bs ], blsG1 ),
        _dbn => {
            return IRNative.bls12_381_G1_uncompress;
        }
    )
);