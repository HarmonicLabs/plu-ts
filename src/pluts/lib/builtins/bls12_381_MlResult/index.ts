import { PBlsG2 } from "../../../PTypes/PBlsG2";
import { blsG1, blsG2, blsResult, bool, fn } from "../../../../type_system/types";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { Term } from "../../../Term";
import { PBool } from "../../../PTypes/PBool";
import { PBlsMlRes } from "../../../PTypes/PBlsMlRes";
import { addApplications } from "../addApplications";

export const bls12_381_millerLoop = addApplications<[ PBlsG2, PBlsG2 ], PBlsMlRes>(
    new Term(
        fn([ blsG1, blsG2 ], blsResult ),
        _dbn => {
            return IRNative.bls12_381_millerLoop;
        }
    )
);

export const bls12_381_mulMlResult = addApplications<[ PBlsMlRes, PBlsMlRes ], PBlsMlRes>(
    new Term(
        fn([ blsResult, blsResult ], blsResult ),
        _dbn => {
            return IRNative.bls12_381_mulMlResult;
        }
    )
);

export const bls12_381_finalVerify = addApplications<[ PBlsMlRes, PBlsMlRes ], PBool>(
    new Term(
        fn([ blsResult, blsResult ], bool ),
        _dbn => {
            return IRNative.bls12_381_finalVerify;
        }
    )
);