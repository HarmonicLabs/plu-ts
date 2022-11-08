import { pif, ptrace } from "./Builtins";
import { pBool } from "../PTypes/PBool";
import { TermFn } from "../PTypes/PFn/PLam";
import PString from "../PTypes/PString";
import { pdelay, perror, pfn, pforce, phoist, plam } from "../Syntax/syntax";
import { bool, ConstantableTermType, delayed, str, ToPType } from "../Term/Type/base";

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