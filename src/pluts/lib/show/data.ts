import { bs, data } from "../../../type_system";
import { pserialiseData, ptrace } from "../builtins";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { pbsToHex } from "./bs";

export const pshowData = phoist(
    plam( data, bs )
    ( d => pbsToHex.$( pserialiseData.$( d ) ) )
);

export const ptraceData = phoist(
    plam( data, data )
    ( d => ptrace( data ).$( pshowData.$( d ).utf8Decoded ).$( d ) )
);