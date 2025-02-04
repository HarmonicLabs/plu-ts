import { IRFunc, IRHoisted, IRConst } from "../../../../IR";
import { bool, unit, fn } from "../../../../type_system";
import { addApplications } from "../../builtins/addApplications";
import { PBool } from "../../../PTypes/PBool";
import { PUnit } from "../../../PTypes/PUnit";
import { Term } from "../../../Term";

/**
 we could use `mkNilData` builtin to check if we actually have units
 but we likely dont want the execution to fail by calling `peqUnit`
 so this is just a dummy function that always retuns true.
*/
export const peqUnit =
    addApplications<[ PUnit, PUnit ], PBool>(
        new Term(
            fn([ unit, unit ], bool ),
            _dbn => new IRHoisted(
                new IRFunc( 2, IRConst.bool( true ) )
            )
        )
    );