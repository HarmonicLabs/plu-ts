import Term from ".";
import UPLCTerm from "../../UPLC/UPLCTerm";
import PType from "../PType";
import PLam from "../PTypes/PFn/PLam";
import { papp } from "../Syntax";

/*
export default class LamTerm< In extends PType, Out extends PType > extends Term<PLam<In,Out>>
{
    [Symbol.hasInstance]< A extends PType = PType, B extends PType = PType>( instance: any ): instance is LamTerm< A, B>
    {
        return(
            LamTerm.isPrototypeOf( instance ) || // default instanceof
            (
                Object.getPrototypeOf( instance ) === Term.prototype &&
                Object.keys( instance ).includes( "$" ) &&
                typeof instance["$"] === "function" &&
                instance["$"].length === 1
            )
        );
    }

    static isStrictInstance< A extends PType = PType, B extends PType = PType>( instance: any ): instance is LamTerm<A, B>
    {
        return Object.getPrototypeOf( instance ) === LamTerm.prototype
    }

    constructor( toUPLC: (dbn: bigint ) => UPLCTerm )
    {
        super( toUPLC );
    }

    static fromTerm< In extends PType = PType, Out extends PType = PType >( term: Term<PLam< In, Out >>): LamTerm<In, Out>
    {
        return new LamTerm( term.toUPLC );
    }

    static toTerm< In extends PType, Out extends PType >( lamTerm: LamTerm<In, Out>): Term<PLam< In, Out >>
    {
        return new Term( lamTerm.toUPLC );
    }

    toTerm(): Term<PLam< In, Out >>
    {
        return LamTerm.toTerm( this );
    }

    $( input: Term<In> )
    {
        const out = papp( this, input );
        return out instanceof LamTerm ? LamTerm.fromTerm( out ) : out;
    } 
}
*///