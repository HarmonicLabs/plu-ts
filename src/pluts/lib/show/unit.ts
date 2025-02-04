import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { bs, unit } from "../../../type_system";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { pByteString } from "../std";

export const pshowUnit = phoist(
    plam( unit, bs )
    ( _ => pByteString( fromAscii("()") )  
    )
);