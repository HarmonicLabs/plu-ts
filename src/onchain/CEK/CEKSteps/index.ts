import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCTerm, { PureUPLCTerm } from "../../UPLC/UPLCTerm";
import CEKEnv from "../CEKEnv";
import PartialBuiltin from "../BnCEK/PartialBuiltin";
import LambdaCEK from "../LambdaCEK";
import DelayCEK from "../DelayCEK";

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
        return new ComputeStep( this.term.clone(), this.env.clone() )
    }
}

export type CEKValue = PureUPLCTerm | PartialBuiltin | LambdaCEK | DelayCEK

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
        return new ReturnStep( this._value.clone() );
    }
}

export type CEKStep = ComputeStep | ReturnStep;

export default class CEKSteps
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

    pop()
    {
        return this._steps.pop();
    }

    top(): Readonly<CEKStep> | undefined
    {
        if( this._steps.length === 0 ) return undefined;
        return JsRuntime.objWithUnderscoreAsPrivate( this._steps[ this._steps.length - 1 ] );
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