import PlutsCEKError from "../../errors/PlutsCEKError";
import PlutsCEKUnboundVarError from "../../errors/PlutsCEKError/PlutsCEKComputeError/PlutsCEKUnboundVarError";
import Debug from "../../utils/Debug";
import Term from "../pluts/Term";
import UPLCTerm, { isPureUPLCTerm, PureUPLCTerm } from "../UPLC/UPLCTerm";
import Application from "../UPLC/UPLCTerms/Application";
import Builtin from "../UPLC/UPLCTerms/Builtin";
import Delay from "../UPLC/UPLCTerms/Delay";
import ErrorUPLC from "../UPLC/UPLCTerms/ErrorUPLC";
import Force from "../UPLC/UPLCTerms/Force";
import HoistedUPLC from "../UPLC/UPLCTerms/HoistedUPLC";
import Lambda from "../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../UPLC/UPLCTerms/UPLCVar";
import BnCEK from "./BnCEK";
import PartialBuiltin from "./BnCEK/PartialBuiltin";
import CEKEnv from "./CEKEnv";
import CEKFrames from "./CEKFrames";
import ForceFrame from "./CEKFrames/ForceFrame";
import LApp from "./CEKFrames/LApp";
import RApp from "./CEKFrames/RApp";
import CEKSteps, { ComputeStep, ReturnStep } from "./CEKSteps";
import DelayCEK from "./DelayCEK";
import LambdaCEK from "./LambdaCEK";

export default function evalScript( _term: UPLCTerm ): PureUPLCTerm
{
    const frames = new CEKFrames();
    const steps = new CEKSteps();

    compute( _term, new CEKEnv() );

    while( !frames.isEmpty || steps.topIsCompute )
    {
        const nextStep = steps.pop();
        if( nextStep === undefined )
        {
            throw new PlutsCEKError("step stack was empty; don't know how to proceed");
        }
        if( nextStep instanceof ComputeStep )
        {
            compute( nextStep.term, nextStep.env );
        }
        else if( nextStep instanceof ReturnStep )
        {
            returnCEK( nextStep.value );
        }
        else throw new PlutsCEKError( "unknown step" );
    }

    function compute( term: UPLCTerm, env: CEKEnv ): void
    {
        Debug.log(
            "----------------- COMPUTE -----------------",
            "\nframes: ", frames,
            "\nenv: ", env,
            "\nterm: ", term,
            "\n-------------------------------------------"
        );

        if( term instanceof HoistedUPLC )
        {
            // HoistedUPLC are always closed; do not need external variables
            steps.push( new ComputeStep( term.UPLC, new CEKEnv() ) );
            return;
        }
        if( term instanceof ErrorUPLC )
        {
            steps.push( new ReturnStep( term ) );
            return;
        }

        if( term instanceof UPLCVar )
        {
            const varValue = env.get( term.deBruijn );
            if( varValue === undefined ) throw new PlutsCEKUnboundVarError();
            steps.push( new ReturnStep( varValue ) );
            return;
        }

        if( term instanceof UPLCConst )
        {
            steps.push( new ReturnStep( term ) );
            return;
        }

        if( term instanceof Lambda )
        {
            steps.push(
                new ReturnStep(
                    new LambdaCEK( term.body.clone(), env )
                )
            );

            return;
        }

        if( term instanceof Delay )
        {
            steps.push(
                new ReturnStep(
                    new DelayCEK(
                        term.delayedTerm,
                        env
                    )
                )
            );
            return;
        }

        if( term instanceof Force )
        {
            frames.push( new ForceFrame );
            steps.push( new ComputeStep( term.termToForce, env ) );
            return;
        }

        if( term instanceof Application )
        {
            frames.push( new RApp( term.argTerm, env ) );
            steps.push( new ComputeStep( term.funcTerm, env ) );
            return;
        }

        if( term instanceof Builtin )
        {
            steps.push(
                new ReturnStep(
                    new PartialBuiltin( term.tag )
                )
            );
            return;
        }

        steps.push( new ReturnStep( new ErrorUPLC("ComputeStep/no match") ) )
        return;
    }

    function returnCEK( v: UPLCTerm ): void
    {
        Debug.log(
            "----------------- RETURN -----------------",
            "\nframes: ", (frames as any)._frames,
            "\nvalue: ", v,
            "\n-------------------------------------------"
        );

        if( v instanceof HoistedUPLC )
        {
            steps.push( new ComputeStep( v.UPLC, new CEKEnv() ) );
            return;
        }
        if( v instanceof ErrorUPLC )
        {
            steps.push( new ReturnStep( v ) );
            return;
        }

        if( v instanceof PartialBuiltin )
        {
            if( v.nMissingArgs === 0 )
            {
                steps.push( new ReturnStep( BnCEK.eval( v ) ) );
                return;
            }
            if( frames.isEmpty )
            {
                steps.push( new ReturnStep( new ErrorUPLC("ReturnStep/PartialBuiltin/empty frames") ) );
                return;
            }
        }

        if( frames.isEmpty )
        {
            // ends while loop
            steps.push( new ReturnStep( v ) );
            return;    
        }

        const topFrame = frames.pop();

        if( topFrame instanceof ForceFrame )
        {
            if(
                v instanceof Delay      ||
                v instanceof DelayCEK
            )
            {
                steps.push(
                    new ComputeStep(
                        v.delayedTerm,
                        v instanceof DelayCEK ? v.env : new CEKEnv()
                    )
                );
                return;
            }

            // not sure about the env...
            steps.push(
                new ComputeStep(
                    v,
                    new CEKEnv()
                )
            );
            return;
        }
        // builtin forces are added only at compile time
        // ence not present in plu-ts UPLCTerm

        if( topFrame instanceof RApp )
        {
            frames.push( new LApp( v ) );
            steps.push( new ComputeStep( topFrame.arg, topFrame.env ) );
            return;
        }

        if( topFrame instanceof LApp )
        {
            if(
                topFrame.func instanceof Lambda     ||
                topFrame.func instanceof LambdaCEK
            )
            {
                const _env = topFrame.func instanceof LambdaCEK ?
                    topFrame.func.env :
                    new CEKEnv();

                _env.push( v );

                steps.push(
                    new ComputeStep(
                        topFrame.func.body,
                        _env
                    )
                );
                return;
            }
            
            if(
                topFrame.func instanceof Builtin || 
                topFrame.func instanceof PartialBuiltin 
            )
            {
                let bn = topFrame.func
                if( bn instanceof Builtin )
                {
                    bn = new PartialBuiltin( bn.tag );
                }

                if( bn.nMissingArgs === 0 ) return returnCEK( BnCEK.eval( bn ) );

                bn.apply( v )

                // choose what to do based on the frames
                return returnCEK( bn );
            }
        }

        steps.push( new ReturnStep( new ErrorUPLC("ReturnStep/LApp") ) )
        return;
    }

    return (steps.pop() as ReturnStep).value ?? new ErrorUPLC("steps.pop() not a ReturnStep");
}