import { PlutsCEKComputeError } from "..";

export class PlutsCEKUnboundVarError extends PlutsCEKComputeError
{
    constructor( msg: string = "trying to evaluate an unbound variable" )
    {
        super(msg)
    }
}