import PlutsCEKFrameError from "../../../errors/PlutsCEKError/PlutsCEKFrameError";
import ForceFrame from "./ForceFrame";
import LApp from "./LApp";
import RApp from "./RApp";

export type Frame = ForceFrame | LApp | RApp ;

export default class CEKFrames
{
    private _frames: Frame[];
    constructor()
    {
        this._frames = []
    }

    get isEmpty(): boolean { return this._frames.length === 0; }

    push( f: Frame ): void
    {
        this._frames.push( f );
    }

    pop(): Frame
    {
        const f = this._frames.pop();
        if( f === undefined )
        {
            throw new PlutsCEKFrameError("frames stack was empty while trying to pop a frame");
        }
        return f;
    }
}