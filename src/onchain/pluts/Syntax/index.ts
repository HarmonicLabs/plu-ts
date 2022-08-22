import BasePlutsError from "../../../errors/BasePlutsError";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import { Head, Tail } from "../../../utils/ts";
import { curryFirst } from "../../../utils/ts/combinators";
import Application from "../../UPLC/UPLCTerms/Application";
import Delay from "../../UPLC/UPLCTerms/Delay";
import Force from "../../UPLC/UPLCTerms/Force";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import PType from "../PType";
import PDelayed from "../PTypes/PDelayed";
import PLam, { ApplicableTerm, TermFn } from "../PTypes/PFn/PLam";
import Term from "../Term";


export function papp<Input extends PType, Output extends PType >( a: Term<PLam<Input,Output>>, b: Term<Input> ): Term<Output>
{
    return new Term( dbn => {
        return new Application(
            a.toUPLC( dbn ),
            b.toUPLC( dbn )
        )
    });
}

export function plam<A extends PType, B extends PType >( termFunc: ( input: Term<A> ) => Term<B> ): ApplicableTerm<A,B>
{
    const lambdaTerm  = new Term<PLam<A,B>>( dbn => {
        const thisLambdaPtr = dbn + BigInt( 1 );
        const boundVar = new Term<A>( dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr ) );
        
        // here the debruijn level is incremented
        return new Lambda( termFunc( boundVar ).toUPLC( thisLambdaPtr ) );
    });

    // allows ```lambdaTerm.$( input )``` syntax
    // rather than ```papp( lambdaTerm, input )```
    // preserving Term Type
    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: Term<A> ) => papp( lambdaTerm, input )
    ) as ApplicableTerm<A,B>;
}

type MapTermOver< PTypes extends PType[] > =
    PTypes extends [] ? []:
    PTypes extends [ infer PInstance extends PType ] ? [ Term< PInstance > ] : 
    PTypes extends [ infer PInstance extends PType , ...infer PInstances extends PType[] ] ? 
        [ Term< PInstance > , ...MapTermOver< PInstances  > ] :
    never;

// export type TermFn< Inputs extends [ PType, ...PType[] ], Output extends PType > =
//     Inputs extends [] ? never :
//     Inputs extends [ infer Input extends PType ] ? ApplicableTerm< Input, Output > :
//     Inputs extends [ infer Input extends PType, ...infer RestIns extends [ PType, ...PType[] ] ] ? ApplicableTerm< Input, PFn< RestIns, Output > > : 
//     never
/**
 * @fixme
*/
export function pfn< Inputs extends [ PType, ...PType[] ], Output extends PType >
    ( termFunc: ( fstInput: Term< Head< Inputs > >, ...ins: MapTermOver< Tail< Inputs > > ) => Term< Output > )
    : TermFn< Inputs, Output >
{
    if( termFunc.length === 0 ) throw new BasePlutsError( "unsupported '(void) => any' type at Pluts level" );
    if( termFunc.length === 1 ) return plam( termFunc as any ) as any;

    return plam( ( input: Term< Head< Inputs > > ) => pfn( curryFirst( termFunc as any )( input ) as any ) ) as any
}

export function pdelay<PInstance extends PType>( toDelay: Term<PInstance> ): Term<PDelayed<PInstance>>
{
    return new Term((dbn) => {
        return new Delay(
            toDelay.toUPLC( dbn )
        );
    })
}

export function pforce<PInstance extends PType>( toForce: Term<PDelayed<PInstance>> ): Term<PInstance>
{
    return new Term( (dbn) => {

        const toForceUPLC = toForce.toUPLC( dbn );

        // if directly applying to Delay UPLC just remove the delay
        //
        // (force (delay (con int 11))) === (con int 11)
        if( toForceUPLC instanceof Delay )
        {
            return toForceUPLC.delayedTerm;
        }

        /*
        any other case that evaluates to Delay
        
        example:
        ```uplc
        [
            [
                [ ifThenElse someBoolean ]
                (delay (con int 42))
            ]
            (delay (con int 69))
        ]
        ```
        is an Application that evaluates to a delayed term
        */
        return new Force(
            toForceUPLC
        );
    })
}