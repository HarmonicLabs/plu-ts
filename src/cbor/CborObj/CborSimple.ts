import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

type SimpleValue = boolean | undefined | null | number

export function isSimpleCborValue( v: SimpleValue ): boolean
{
    const t = typeof v;

    return (
        v === null          ||
        t === "boolean"     ||
        t === "undefined"   ||
        t === "number"
    );
}

type SimpleNumAs = "float" | "simple"

export type RawCborSimple = {
    simple: SimpleValue
}

export default class CborSimple
    implements ToRawObj
{
    private _simple: SimpleValue;
    get simple(): SimpleValue { return this._simple; };

    private _numAs: SimpleNumAs;
    get numAs(): SimpleNumAs { return this._numAs; }

    constructor( simple: SimpleValue, interpretNumAs?: SimpleNumAs )
    {
        if(
            interpretNumAs === undefined     &&
            typeof simple === "number"       &&
            simple === Math.abs( Math.round( simple ) )
        )
        interpretNumAs = "simple";

        if( interpretNumAs === undefined ) interpretNumAs = "float";

        if( interpretNumAs === "simple" )
        {
            JsRuntime.assert(
                typeof simple === "number" &&
                simple >= 0 && simple <= 255 &&
                simple === Math.round( simple ),
                "invalid simple value"
            );
        }

        this._simple = simple;
        this._numAs = interpretNumAs;
    }

    toRawObj(): RawCborSimple
    {
        return {
            simple: this._simple
        };
    }
}