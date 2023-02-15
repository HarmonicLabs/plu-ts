import { DataConstr } from "../../../../../types/Data/DataConstr";
import { bool, data } from "../../../type_system/types";
import { pif } from "../../builtins";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pData } from "../data/pData";

export const pBoolToData = phoist(
    plam( bool, data )
    ( b =>
        pif( data ).$( b )
        // 'pnilData' is an hoisted term; no need to 'plet'
        .then( pData(new DataConstr( 0, [] ) ) )
        .else( pData(new DataConstr( 1, [] ) ) )
    )
);