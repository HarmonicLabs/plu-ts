import UPLCSerializable, { getUpdatedCtxAfterAppend, UPLCSerializationContex } from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";
import UPLCVar from "./UPLCVar";
import Lambda from "./Lambda";
import Builtin from "./Builtin";
import { forceInByteOffset } from "../../../../types/bits/Bit";
import UPLCFlatUtils from "../../../../utils/UPLCFlatUtils";
import Debug from "../../../../utils/Debug";

export default class Application
    implements UPLCSerializable
{
    private static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0011" )
        );
    }

    private _func: UPLCVar | Lambda | Application | Builtin 
    private _arg : UPLCTerm;

    get funcTerm(): UPLCVar | Lambda | Application | Builtin 
    {
        return this._func;
    }

    get argTerm(): UPLCTerm
    {
        return this._arg;
    }

    constructor(
        func: UPLCVar | Lambda | Application | Builtin , 
        arg: UPLCTerm
    )
    {
        this._func = func;
        this._arg = arg;
    }

    toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    {
        const result = Application.UPLCTag.clone();
        ctx.updateWithBitStreamAppend( result );

        UPLCFlatUtils.appendTermAndUpdateContext(
            result,
            this.funcTerm,
            ctx
        );

        UPLCFlatUtils.appendTermAndUpdateContext(
            result,
            this.argTerm,
            ctx
        );

        return result;
    }
}