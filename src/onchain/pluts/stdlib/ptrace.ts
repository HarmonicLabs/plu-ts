import { pif, ptrace } from "./Builtins";
import { pBool } from "../PTypes/PBool";
import PString from "../PTypes/PString";
import { pdelay, perror, pfn, pforce, phoist, plam } from "../Syntax/syntax";
import { bool, ConstantableTermType, delayed, str } from "../Term/Type/base";
import { TermFn } from "../PTypes/PFn/PFn";
import { ToPType } from "../Term/Type/ts-pluts-conversion";

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