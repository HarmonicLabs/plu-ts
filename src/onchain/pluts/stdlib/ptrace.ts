import ObjectUtils from "../../../utils/ObjectUtils";
import Application from "../../UPLC/UPLCTerms/Application";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import { pif, ptrace } from "../Prelude/Builtins";
import { pBool } from "../PTypes/PBool";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PString from "../PTypes/PString";
import { papp, pdelay, perror, pfn, pforce, phoist, plam } from "../Syntax";
import Term from "../Term";
import { bool, ConstantableTermType, delayed, fn, lam, str, TermType, ToPType } from "../Term/Type";

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
        ))
    ) as any;
}