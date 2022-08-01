import { CanBeUInteger, forceUInteger, UInteger } from "../../../types/ints/Integer";

export default class UPLCVersion
{
    private _major: UInteger
    private _minor: UInteger
    private _patch: UInteger

    get major(): UInteger {return this._major};
    get minor(): UInteger {return this._minor};
    get patch(): UInteger {return this._patch};

    constructor( major: CanBeUInteger, minor: CanBeUInteger, patch: CanBeUInteger )
    {
        this._major = forceUInteger( major );
        this._minor = forceUInteger( minor );
        this._patch = forceUInteger( patch );
    }

    // deprecated
    //
    // toUPLCBitStream(): BitStream
    // {
    //     const result = this.major.toUPLCBitStream();
    //     result.append( this.minor.toUPLCBitStream() );
    //     result.append( this.patch.toUPLCBitStream() );
    //     return result;
    // }
}