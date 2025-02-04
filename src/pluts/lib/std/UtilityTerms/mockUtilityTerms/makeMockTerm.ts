import { IRVar } from "../../../../../IR/IRNodes/IRVar";
import { CompilerOptions } from "../../../../../IR/toUPLC/CompilerOptions";
import { Term } from "../../../../Term";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { TermType } from "../../../../../type_system/types";

const mockTermIr = Object.freeze( new IRVar( 0 ) );

function genMockTermIr( _cfg: CompilerOptions, _dbn: bigint ): IRVar
{
    return mockTermIr as IRVar;
}

export function makeMockTerm<T extends TermType>( t: T ): Term<ToPType<T>>
{
    return new Term(
        t,
        genMockTermIr
    );
}