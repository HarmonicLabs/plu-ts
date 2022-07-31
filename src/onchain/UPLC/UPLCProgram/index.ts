import UPLCSerializable from "../UPLCEncoder/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import { CanBeUInteger } from "../../../types/ints/Integer";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";
import UPLCTerm from "../UPLCTerm";
import UPLCVersion from "./UPLCVersion";


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

    // deprecated
    //
    // toUPLCBitStream(): BitStream
    // {
    //     const result = this.version.toUPLCBitStream();
    //
    //     result.append(
    //         this.body.toUPLCBitStream(
    //             new UPLCSerializationContex({
    //                 currLength: result.length
    //             })
    //         )
    //     );
    //     
    //     UPLCFlatUtils.padToByte( result );
    //     
    //     return result;
    // }

}