import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import UPLCVersion, { CanBeUInteger } from "./UPLCVersion";


export default class UPLCProgram
    implements UPLCSerializable
{
    private _version: UPLCVersion
    get version(): UPLCVersion { return this._version };

    private _body: UPLCTerm
    get body(): UPLCTerm { return this._body };

    constructor(
        version: UPLCVersion | [ CanBeUInteger, CanBeUInteger, CanBeUInteger ],
        body: UPLCTerm
    )
    {
        if( Array.isArray( version ) )
        {
            this._version = new UPLCVersion( ...version );
        }
        else
        {
            this._version = version;
        }

        this._body = body;
    }

    toUPLCBitStream(): BitStream
    {
        const result = this.version.toUPLCBitStream();
        result.append( this.body.toUPLCBitStream() );
        BitStream.padToByte( result );
        return result;
    }
}