import { ErrorUPLC } from "../../UPLC/UPLCTerms/ErrorUPLC";
import { TermType, Term } from "../Term";
import { ToPType } from "../Term/Type/ts-pluts-conversion";

export function perror<T extends TermType>( type: T , msg: string | undefined = undefined, addInfos: object | undefined = undefined): Term<ToPType<T>>
{
    return new Term(
        type as any,
        _dbn => new ErrorUPLC( msg, addInfos )
    );
}
