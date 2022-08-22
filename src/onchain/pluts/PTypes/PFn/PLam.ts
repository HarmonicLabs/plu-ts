import PFn from ".";
import { Head } from "../../../../utils/ts/TyLists";
import PType from "../../PType"
import Term from "../../Term";


export default class PLam<A extends PType, B extends PType > extends PType
{
    // phantom
    private _input?: A
    private _output?: B
}

export type  PLamIn< PLamInstance extends PLam< PType, PType > > = PLamInstance extends PLam< infer PIn, any >  ? PIn  : never;
export type PLamOut< PLamInstance extends PLam< PType, PType > > = PLamInstance extends PLam< any, infer POut > ? POut : never;

export type ApplicableTerm<In extends PType, Out extends PType> =
    Term<PLam<In, Out>> 
    & { $: ( input: Term<In> ) => 
            (Out extends PLam< infer PLamIn extends PType, infer PLamOut extends PType > ? 
                ApplicableTerm<PLamIn, PLamOut> :
            Out extends PType ?
                Term<Out> :
                never
            )
    }

export type TermFn<Ins extends [ PType, ...PType[] ] , Out extends PType> =
    Ins extends [ infer PInstance extends PType ] ? Term<PLam< PInstance, Out>> & { $: ( input: Term< PInstance > ) => Term< Out > } :
    Ins extends [ infer PInstance extends PType, ...infer RestIns extends [ PType, ...PType[] ] ] ?
        Term<PLam<PInstance, PFn< RestIns, Out > > >
        & { $: ( input: Term< PInstance > ) => TermFn< RestIns, Out > } :
    never

export type UnTermLambda< LamTerm extends Term<PLam<PType, PType>> > =
    LamTerm extends Term<PLam<infer In extends PType, infer Out extends PType >> ? PLam< In, Out > :
    never;