import { Cloneable } from "../../../types/interfaces/Cloneable";

import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { CEKEnv } from "../CEKEnv";
import { CEKValue } from "../CEKValue";

export class ComputeStep
    implements Cloneable<ComputeStep>
{
    private _term: UPLCTerm;
    get term(): UPLCTerm
    { return this._term; }  
    
    private _env: CEKEnv;
    get env(): CEKEnv
    { return this._env; }  

    constructor( term: UPLCTerm, env: CEKEnv )
    {
        this._term = term;
        this._env = env;
    }

    clone(): ComputeStep
    {
        return new ComputeStep(
            this._term.clone(),
            this._env.clone()
        )
    }
}
export class ReturnStep
    implements Cloneable<ReturnStep>
{
    private _value: CEKValue;
    get value(): CEKValue { return this._value; }

    constructor( value: CEKValue )
    {
        this._value = value;
    }

    clone(): ReturnStep
    {
        return new ReturnStep(
            this.value.clone()
        )
    }
}

export type CEKStep = ComputeStep | ReturnStep;

export class CEKSteps
{
    private _steps: CEKStep[]

    constructor()
    {
        this._steps = []
    }

    push( step: CEKStep )
    {
        this._steps.push( step );
    }

    pop(): CEKStep | undefined
    {
        return this._steps.pop();
    }

    top(): Readonly<CEKStep> | undefined
    {
        if( this._steps.length === 0 ) return undefined;
        return Object.freeze( this._steps[ this._steps.length - 1 ] );
    }

    _unsafe_clear(): void
    {
        this._steps.length = 0;
    }

    get topIsReturn(): boolean
    {
        return this._steps[ this._steps.length - 1 ] instanceof ReturnStep;
    }
    get topIsCompute(): boolean
    {
        return this._steps[ this._steps.length - 1 ] instanceof ComputeStep;
    }
}