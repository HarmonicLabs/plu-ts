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

export type ApplicableTerm<In extends PType, Out extends PType> = Term<PLam<In, Out>> & { $: ( input: Term<In> ) => Term<Out> }