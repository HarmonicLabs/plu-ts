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
import PType, { ToCtors } from "../PType";
import PDelayed from "../PTypes/PDelayed";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import Term from "../Term";


export function papp<Input extends PType, Output extends PType >( outCtor: new () => Output )
{
    return ( a: Term<PLam<Input,Output>>, b: Term<Input> ): Term<Output> =>
    {
        return new Term( dbn => {
                return new Application(
                    a.toUPLC( dbn ),
                    b.toUPLC( dbn )
                )
            },
            new outCtor
        );
    }
}

export function plam<A extends PType, B extends PType >( inCtor: new () => A, outCtor: new () => B )
{
    return ( termFunc: ( input: Term<A> ) => Term<B> ): TermFn<[A],B> =>
    {
        const lambdaTerm  = new Term<PLam<A,B>>( dbn => {
                const thisLambdaPtr = dbn + BigInt( 1 );
                const boundVar = new Term<A>( dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr ), new inCtor );
                
                // here the debruijn level is incremented
                return new Lambda( termFunc( boundVar ).toUPLC( thisLambdaPtr ) );
            },
            new PLam( new inCtor, new outCtor )
        );
    
        // allows ```lambdaTerm.$( input )``` syntax
        // rather than ```papp( lambdaTerm, input )```
        // preserving Term Type
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term<A> ) => papp( outCtor )( lambdaTerm, input )
        );
    }   
}

type MapTermOver< PTypes extends PType[] > =
    PTypes extends [] ? []:
    PTypes extends [ infer PInstance extends PType ] ? [ Term< PInstance > ] : 
    PTypes extends [ infer PInstance extends PType , ...infer PInstances extends PType[] ] ? 
        [ Term< PInstance > , ...MapTermOver< PInstances  > ] :
    never;

/**
 * @fixme "ts-ignore"
*/
export function pfn< Inputs extends [ PType, ...PType[] ], Output extends PType > ( ...ctors: [ ...ToCtors<Inputs>, new () => Output ] )
{
    return ( termFunc: ( fstInput: Term< Head< Inputs > >, ...ins: MapTermOver< Tail< Inputs > > ) => Term< Output > )
        : TermFn< Inputs, Output > =>
    {
        if( termFunc.length === 0 ) throw new BasePlutsError( "unsupported '(void) => any' type at Pluts level" );
        if( termFunc.length === 1 ) return plam( ctors[0], ctors[1] )( termFunc as any ) as any;

        /*
        Type 'Term<PLam<Head<Inputs>, Output>> & { $: (input: Term<Head<Inputs>>) => Term<Output>; }'
        is not assignable to type 'TermFn<Inputs, Output>'
        
        where TermFn< Inputs, Output > translates to
            Term<PLam<Head<Inptus>, PFn< Tail<Inputs>, Output > > >
            & { $: ( input: Term< Head<Inptus> > ) => TermFn< Tail<Inputs>, Output > }

        so the issue here is in the fact that Typescript doesn't recognizes 'Output' to be 'PFn< Tail<Inputs>, Output >'
        */
        //@ts-ignore
        return plam( ctors[0] , PLam )(
            //@ts-ignore
            ( input: Term< Head< Inputs > > ) =>
                //@ts-ignore
                pfn( ...ctors.slice(1) )( 
                    curryFirst(
                        /*
                        Argument of type '(fstInput: Term<Head<Inputs>>, ...ins: MapTermOver<Tail<Inputs>>) => Term<Output>'
                        is not assignable to parameter of type '(arg1: any, ...args: any[]) => Term<Output>'.
                            Types of parameters 'ins' and 'args' are incompatible.
                                Type 'any[]' is not assignable to type 'MapTermOver<Tail<Inputs>>'

                        basically typescript desn't recognizes 'MapTermOver<Tail<Inputs>>' to be an array of types (which is)
                        */
                        //@ts-ignore
                        termFunc
                    )( input )
                ) 
        );
    }
}
    

export function pdelay<PInstance extends PType>( ctor: new () => PInstance ): (toDelay: Term<PInstance>) => Term<PDelayed<PInstance>>
{
    return ( toDelay: Term<PInstance> ): Term<PDelayed<PInstance>> =>
    {
        return new Term((dbn) => {
                return new Delay(
                    toDelay.toUPLC( dbn )
                );
            },
            new PDelayed( new ctor() )
        )
    }
}
    

export function pforce<PInstance extends PType>( ctor: new () => PInstance ) 
{
    return ( toForce: Term<PDelayed<PInstance>> ): Term<PInstance> =>
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
        },
        new ctor
        )
    }
}