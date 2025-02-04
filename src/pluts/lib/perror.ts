import { IRError } from "../../IR/IRNodes/IRError";
import { Term } from "../Term";
import { TermType, ToPType } from "../../type_system";

export function perror<T extends TermType>( type: T , msg: string | undefined = undefined, addInfos: object | undefined = {}): Term<ToPType<T>>
{
    addInfos =
        typeof addInfos === "object" &&
        addInfos !== null ? 
        addInfos : 
        { __original__: addInfos };

    let src = new Error().stack?.split("\n")[2];
    src = src?.slice( src.indexOf("at ") + 3 );
    
    (addInfos as any).__src__ = src;
    
    return new Term(
        type as any,
        _dbn => new IRError( msg, addInfos )
    )
}
