import { CanBeUInteger, forceBigUInt } from "../../../types/ints/Integer";

export class UPLCVersion
{
    private _major: bigint
    private _minor: bigint
    private _patch: bigint

    get major(): bigint {return this._major};
    get minor(): bigint {return this._minor};
    get patch(): bigint {return this._patch};

    constructor( major: CanBeUInteger, minor: CanBeUInteger, patch: CanBeUInteger )
    {
        this._major = forceBigUInt( major );
        this._minor = forceBigUInt( minor );
        this._patch = forceBigUInt( patch );
    }
}