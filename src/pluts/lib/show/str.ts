import { str } from "../../../type_system/types";
import { pid, ptrace } from "../builtins";
import { phoist } from "../phoist";
import { plam } from "../plam";

export const pshowStr = pid( str );

export const ptraceStr = phoist(
    plam( str, str )
    ( s => ptrace( str ).$( s ).$( s ) )
);