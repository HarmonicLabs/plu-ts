import { TermFn } from "../../PTypes";
import { ToPType } from "../../../type_system/ts-pluts-conversion";
import { TermType, int } from "../../../type_system/types";
import { ptrace } from "../builtins";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { pshow } from "./pshow";

export function ptraceVal<T extends TermType>( t: T )
: TermFn<[ ToPType<T> ], ToPType<T> >
{
    return phoist(
        plam( t, t )
        ( val => ptrace( t ).$( pshow( t ).$( val ).utf8Decoded ).$( val ) as any )
    ) as any;
};

export const ptraceInt = ptraceVal( int );