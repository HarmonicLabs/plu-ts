import { CanBeUInteger, forceUInteger, UInteger } from "../../../types/ints/Integer";

export class UPLCVersion
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
}