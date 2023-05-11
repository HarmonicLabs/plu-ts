import { IRApp, IRHoisted, IRFunc, IRVar } from "../../../../../IR";
import { PType } from "../../../../PType"
import { PLam } from "../../../../PTypes"
import { Term } from "../../../../Term"
import { TermType, fn, lam } from "../../../../type_system"


export function _papp<Input extends PType, Output extends PType>( a: Term<PLam<Input,Output>>, b: Term<Input> ): Term<Output>
{
    const outT = a.type[2];
    if( outT === undefined )
    {
        console.log( a.type );
    }
    return new Term(
        outT as any,
        dbn => new IRApp(
            a.toIR(dbn),
            b.toIR(dbn)
        )
    )
}

export const _pcompose = ( a: TermType, b: TermType, c: TermType) =>
new Term(
    fn([
        lam( b, c ),
        lam( a, b ),
        a
    ],  c),
    _dbn => new IRHoisted(
        new IRFunc( 3,
            new IRApp(
                new IRVar(2),
                new IRApp(
                    new IRVar(1),
                    new IRVar(0)
                )
            )
        )
    )
)
