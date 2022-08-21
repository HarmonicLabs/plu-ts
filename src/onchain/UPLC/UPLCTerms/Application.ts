import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import UPLCVar from "./UPLCVar";
import Lambda from "./Lambda";
import Builtin from "./Builtin";
import Force from "./Force";

export type UPLCApplicationBody = UPLCVar | Lambda | Application | Builtin | Force

export function isUPLCApplicationBody( uplc: UPLCTerm ): uplc is UPLCApplicationBody
{
    const proto = Object.getPrototypeOf( uplc );

    // only strict instances
    return (
        proto === UPLCVar.prototype         ||
        proto === Lambda.prototype          ||
        proto === Application.prototype     ||
        proto === Force.prototype           ||
        proto === Builtin.prototype
    );
}

export default class Application
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0011" )
        );
    }

    private _func: UPLCTerm
    private _arg : UPLCTerm;

    get funcTerm(): UPLCTerm
    {
        return this._func;
    }

    get argTerm(): UPLCTerm
    {
        return this._arg;
    }

    constructor(
        func: UPLCTerm,
        arg: UPLCTerm
    )
    {
        this._func = func;
        this._arg = arg;
    }
}