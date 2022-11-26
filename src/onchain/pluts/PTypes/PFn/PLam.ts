import PFn from "./PFn";
import Cloneable, { isCloneable } from "../../../../types/interfaces/Cloneable";
import { Tail } from "../../../../utils/ts";
import PType from "../../PType"
import { UtilityTermOf } from "../../stdlib/UtilityTerms/addUtilityForType";
import Term from "../../Term";
import { PappArg } from "../../Syntax/pappArg";


/// <reference path="./PLam.d.ts"/>
export default class PLam<A extends PType, B extends PType > extends PType
    implements Cloneable<PLam<A,B>>
{
    // phantom
    private _input: A
    private _output: B

    constructor( input: A = new PType as A, output: B = new PType as B )
    {
        super();
        this._input = input;
        this._output = output;
    }

    clone(): PLam<A,B>
    {
        return new PLam(
            isCloneable( this._input ) ? this._input.clone() : this._input ,
            isCloneable( this._output ) ? this._output.clone() : this._output 
        ) as PLam<A,B>;
    }

}

// @ts-check
export type  PLamIn< PLamInstance extends PLam< PType, PType > > = PLamInstance extends PLam< infer PIn, any >  ? PIn  : never;
// @ts-check
export type PLamOut< PLamInstance extends PLam< PType, PType > > = PLamInstance extends PLam< any, infer POut > ? POut : never;

// @ts-check
export type TermFn<Ins extends [ PType, ...PType[] ] , Out extends PType> =
    Out extends PLam<infer A extends PType, infer B extends PType> ? TermFn<[ Ins[0], ...Tail<Ins> , A ], B> :
    Ins extends [ infer PInstance extends PType ] ? Term<PLam<PInstance, Out>> & { $: ( input: PappArg<PInstance> ) => UtilityTermOf<Out> } :
    Ins extends [ infer PInstance extends PType, ...infer RestIns extends [ PType, ...PType[] ] ] ?
        Term<PLam<PInstance,PFn<RestIns, Out>>>
        & { $: ( input: PappArg< PInstance > ) => TermFn<RestIns, Out> } :
    never

// @ts-check
export type UnTermLambda< LamTerm extends Term<PLam<PType, PType>> > =
    LamTerm extends Term<PLam<infer In extends PType, infer Out extends PType >> ? PLam< In, Out > :
    never;