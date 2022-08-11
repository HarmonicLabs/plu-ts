import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborText = {
    text: string
}

export default class CborText
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