import { CharCode } from "../../utils/CharCode";

export function isIllegalVariableIdentifier(name: string): boolean
{
    if( name.length === 0 ) return true;
    switch (name.charCodeAt(0)) {
        case CharCode.d: return name === "delete";
        case CharCode.f: return name === "for";
        case CharCode.i: return name === "instanceof";
        case CharCode.n: return name === "undefined";
        case CharCode.v: return name === "void";
    }
    return false;
}