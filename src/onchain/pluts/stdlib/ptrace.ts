import { pif, ptrace } from "../Prelude/Builtins";
import { pBool } from "../PTypes/PBool";
import { pfn, phoist } from "../Syntax";
import { bool, str } from "../Term/Type";

export const ptraceIfFalse= phoist(
    pfn([
        str,
        bool,
    ],  bool)
    (( msg, boolean ) => 
            pif( bool ).$( boolean )
            .then( pBool( true ) )
            .else( ptrace( bool ).$( msg ).$( pBool( false ) ) )
    )
);