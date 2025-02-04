import { bool, delayed, str, TermType } from "../../../type_system/types";
import { pdelay } from "../pdelay";
import { perror } from "../perror";
import { pfn } from "../pfn";
import { plam  } from "../plam";
import { pforce } from "../pforce";
import { phoist } from "../phoist";
import { pBool } from "./bool";
import { pif } from "../builtins/bool";
import { ptrace } from "../builtins/ptrace";
import { TermFn } from "../../PTypes/PFn/PFn";
import { PString } from "../../PTypes/PString";
import { ToPType } from "../../../type_system/ts-pluts-conversion";

export const ptraceIfTrue = phoist(
    pfn([
        delayed( str ),
        bool,
    ],  bool)
    (( msg, boolean ) => 
        pif( bool ).$( boolean )
        .then( ptrace( bool ).$( pforce( msg ) ).$( pBool( true ) ) )
        .else( pBool( false ) )
    )
);

export const ptraceIfFalse = phoist(
    pfn([
        delayed( str ),
        bool,
    ],  bool)
    (( msg, boolean ) => 
        pif( bool ).$( boolean )
        .then( pBool( true ) )
        .else( ptrace( bool ).$( pforce( msg ) ).$( pBool( false ) ) )
    )
);

export function ptraceError<T extends TermType>( t: T, somemsg?: string )
    : TermFn<[ PString ], ToPType<T>>
{
    return phoist(
        plam( str, t )
        ( msg => pforce(
            ptrace( delayed( t ) ).$( msg ).$( pdelay( perror( t, somemsg ) ) )
        ) as any )
    ) as any;
}