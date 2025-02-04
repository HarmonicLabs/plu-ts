import { IRApp } from "../../../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../../../IR/IRNodes/IRFunc";
import { IRHoisted } from "../../../../../IR/IRNodes/IRHoisted";
import { IRVar } from "../../../../../IR/IRNodes/IRVar";
import { PType } from "../../../../PType"
import { PLam } from "../../../../PTypes"
import { Term } from "../../../../Term"
import { TermType, ToPType, fn, lam } from "../../../../../type_system"


export function _papp<Input extends PType, Output extends PType>( a: Term<PLam<Input,Output>>, b: Term<Input> ): Term<Output>
{
    const outT = a.type[2];
    if( outT === undefined )
    {
        console.log( a.type );
    }
    return new Term(
        outT as any,
        (cfg, dbn) => new IRApp(
            a.toIR(cfg, dbn),
            b.toIR(cfg, dbn)
        )
    )
}

export function _plam<A extends TermType, B extends TermType >( inputType: A, outputType: B )
: ( 
    termFunc : ( input: Term<ToPType<A>> ) => Term<ToPType<B>>
) => Term<PLam<ToPType<A>,ToPType<B>>>
{
    return ( 
        termFunc: ( input: Term<ToPType<A>> ) => Term<ToPType<B>>
    ) =>
    new Term<PLam<ToPType<A>,ToPType<B>>>(
        lam( inputType, outputType ) as any,
        (cfg, dbn) => {
            const thisLambdaPtr = dbn + BigInt( 1 );

            const boundVar = new Term<ToPType<A>>(
                inputType as any,
                (cfg, dbnAccessLevel) => new IRVar( dbnAccessLevel - thisLambdaPtr )
            );
            
            const body = termFunc( boundVar );

            // here the debruijn level is incremented
            return new IRFunc( 1, body.toIR( cfg, thisLambdaPtr ) );
        }
    );
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
