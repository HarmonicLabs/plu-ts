import { DataConstr } from "@harmoniclabs/plutus-data";
import { asData, bool } from "../../../../type_system/types";
import { pif } from "../../builtins/bool";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { _punsafeConvertType } from "../../punsafeConvertType/minimal";
import { pData } from "../data/pData";

export const pBoolToData = phoist(
    plam( bool, asData( bool ) )
    ( b =>
        pif( asData( bool ) ).$( b )
        .then(
            _punsafeConvertType(
                pData(
                    new DataConstr( 0, [] )
                ),
                asData( bool )
            )
        )
        .else(
            _punsafeConvertType(
                pData(
                    new DataConstr( 1, [] )
                ),
                asData( bool )
            )
        ),
        "pBoolToData"
    )
);