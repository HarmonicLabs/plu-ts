import { pif, ptrace } from ".";
import type { TermFn, PString } from "../../PTypes";
import { str, bool, ConstantableTermType, delayed } from "../../Term";
import { ToPType } from "../../Term/Type/ts-pluts-conversion";
import { pdelay } from "../pdelay";
import { perror } from "../perror";
import { pfn } from "../pfn";
import { pforce } from "../pforce";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { pBool } from "../std/bool/pBool";


// @ts-ignore Type instantiation is excessively deep and possibly infinite.
export const ptraceIfTrue = phoist(
    pfn([
        str,
        bool,
    ],  bool)
    (( msg, boolean ) => 
        pif( bool ).$( boolean )
        .then( ptrace( bool ).$( msg ).$( pBool( true ) ) )
        .else( pBool( false ) )
    )
);

export const ptraceIfFalse = phoist(
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

export function ptraceError<T extends ConstantableTermType>( t: T )
    : TermFn<[ PString ], ToPType<T>>
{
    return phoist(
        plam( str, t )
        ( msg => pforce(
            ptrace( delayed( t ) ).$( msg ).$( pdelay( perror( t ) ) )
        ) as any )
    ) as any;
}