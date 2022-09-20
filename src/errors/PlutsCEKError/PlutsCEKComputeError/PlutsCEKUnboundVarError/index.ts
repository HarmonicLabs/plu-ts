import PlutsCEKComputeError from "..";

export default class PlutsCEKUnboundVarError extends PlutsCEKComputeError
{
    constructor( msg: string = "trying to evalueate an unbound variable" )
    {
        super(msg)
    }
}