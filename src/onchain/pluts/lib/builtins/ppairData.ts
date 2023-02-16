import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PData, PPair, PLam } from "../../PTypes";
import { Term } from "../../Term";
import { fn, data, pair } from "../../type_system";
import { addApplications } from "./addApplications";


export const ppairData: TermFn<[ PData, PData ], PPair<PData,PData>>
    = addApplications<[ PData, PData ], PPair<PData,PData>>(
        new Term(
            fn([ data, data ], pair( data, data ) ),
            _dbn => Builtin.mkPairData
        )
    );