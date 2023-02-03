import JsRuntime from "../../utils/JsRuntime";
import { ToRawObj } from "./interfaces/ToRawObj";

export type RawCborText = {
    text: string
}

export function isRawCborText( t: RawCborText ): boolean
{
    if( typeof t !== "object" ) return false;

    const keys = Object.keys( t );

    return (
        keys.length === 1 &&
        keys[0] === "text" &&
        typeof t.text === "string"
    );
}

export class CborText
    implements ToRawObj
{
    private _text : string;
    get text(): string { return this._text }
    
    constructor( text: string )
    {
        JsRuntime.assert(
            typeof text === "string",
            "invalid text in 'CborText' passed"
        );

        this._text = text;
    }

    toRawObj(): RawCborText
    {
        return {
            text: this.text
        };
    }
}