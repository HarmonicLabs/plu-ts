import PlutsCEKUnboundVarError from "../../errors/PlutsCEKError/PlutsCEKComputeError/PlutsCEKUnboundVarError";
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


export default function evalScript(
    script: UPLCTerm,
    _env: CEKEnv = new CEKEnv(),
    _frames: CEKFrames = new CEKFrames()
): PureUPLCTerm
{
    const env = _env;
    const frames = _frames;

    function compute( uplc: UPLCTerm ): PureUPLCTerm
    {
        console.log("compute; env: ", env);
        console.log("compute; computing value: ", uplc);
        console.log("--------------------------------------------------");

        if( uplc instanceof HoistedUPLC )
        {
            return compute( uplc.UPLC );
        }
        if( uplc instanceof ErrorUPLC ) return uplc;

        if( uplc instanceof UPLCVar )
        {
            const varValue = env.get( uplc.deBruijn );
            if( varValue === undefined ) throw new PlutsCEKUnboundVarError();
            return CEKValue( varValue );
        }

        if(
            uplc instanceof UPLCConst   ||
            uplc instanceof Lambda      ||
            uplc instanceof Delay       ||
            uplc instanceof Builtin
        )
        {
            return CEKValue( uplc instanceof Builtin ? new PartialBuiltin( uplc.tag ) : uplc  );
        }

        if( uplc instanceof Force )
        {
            frames.push( new ForceFrame );
            return compute( uplc.termToForce );
        }

        if( uplc instanceof Application )
        {
            frames.push( new RApp( uplc.argTerm ) );
            return compute( uplc.funcTerm );
        }

        return new ErrorUPLC;
    }

    function CEKValue( uplc: UPLCTerm | PartialBuiltin ): PureUPLCTerm
    {
        console.log("CEKValue; frames: ", frames);
        console.log("CEKValue; value: ", uplc);
        console.log("--------------------------------------------------");

        if( uplc instanceof HoistedUPLC ) return compute( uplc.UPLC );
        if( uplc instanceof ErrorUPLC ) return uplc;

        if( uplc instanceof PartialBuiltin )
        {
            if( uplc.nMissingArgs === 0 ) return CEKValue( BnCEK.eval( uplc ) )
            if( frames.isEmpty ) return new ErrorUPLC;
        }

        if( frames.isEmpty ) return uplc;

        const topFrame = frames.pop();

        if( topFrame instanceof ForceFrame )
        {
            if( uplc instanceof Delay ) return compute( uplc.delayedTerm );
        }
        // builtin forces are added only at compile time
        // ence not present in plu-ts UPLCTerm

        if( topFrame instanceof RApp )
        {
            frames.push( new LApp( uplc ) );
            return compute( topFrame.arg );
        }

        if( topFrame instanceof LApp )
        {
            if( topFrame.func instanceof Lambda )
            {
                env.push( compute( uplc ) );
                return compute( topFrame.func.body );
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

                if( bn.nMissingArgs === 0 ) return CEKValue( BnCEK.eval( bn ) );

                bn.apply( uplc )

                // choose what to do based on the frames
                return CEKValue( bn );
            }
        }

        return new ErrorUPLC
    }

    return compute( script );
}
