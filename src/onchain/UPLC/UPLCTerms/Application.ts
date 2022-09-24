import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import UPLCVar from "./UPLCVar";
import Lambda from "./Lambda";
import Builtin from "./Builtin";
import Force from "./Force";
import Cloneable from "../../../types/interfaces/Cloneable";

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
    implements Cloneable<Application>
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0011" )
        );
    }

    public funcTerm: UPLCTerm
    public argTerm : UPLCTerm;
    
    constructor(
        func: UPLCTerm,
        arg: UPLCTerm
    )
    {
        this.funcTerm = func;
        this.argTerm = arg;
    }

    clone(): Application
    {
        return new Application(
            this.funcTerm.clone(),
            this.argTerm.clone()
        );
    }
}