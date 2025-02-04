import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { bool, bs } from "../../../type_system";
import { pstrictIf, ptrace } from "../builtins";
import { phoist } from "../phoist";
import { plam } from "../plam";

export const pshowBool = phoist(
    plam( bool, bs )
    ( b =>
        pstrictIf( bs ).$( b )
        .$( fromAscii("true") )
        .$( fromAscii("false") )
    )
);

export const ptraceBool = phoist(
    plam( bool, bool )
    ( b => ptrace( bool ).$( pshowBool.$( b ).utf8Decoded ).$( b ) )
)