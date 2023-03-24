import { BitStream } from "../../../types/bits/BitStream";
import { UPLCVersion } from "../UPLCProgram/UPLCVersion";

export interface RawUPLCSerializationContex
{
    currLength: number,
    version : {
        major: bigint,
        minor: bigint,
        patch: bigint
    }
}

export class UPLCSerializationContex
{
    private _rawCtx: RawUPLCSerializationContex;
    
    constructor( rawCtx: Partial<RawUPLCSerializationContex> )
    {
        this._rawCtx = {
            currLength : 0,
            version : {
                major: BigInt( 1 ),
                minor: BigInt( 0 ),
                patch: BigInt( 0 )
            },
            ...rawCtx
        };
    }

    get currLength(): number
    {
        return this._rawCtx.currLength;
    }

    private _updateWith( updatedFields: Partial< RawUPLCSerializationContex > ): void
    {
        this._rawCtx = {
            ...this._rawCtx,
            ...updatedFields
        }
    }

    updateVersion( uplcVersion: UPLCVersion )
    {
        this._updateWith({
            version: {
                major: uplcVersion.major,
                minor: uplcVersion.minor,
                patch: uplcVersion.patch,
            }
        })
    }

    incrementLengthBy( n: number ): void
    {
        this._updateWith({
            currLength: this._rawCtx.currLength + n
        })
    }

    /**
     * @deprecated use ```incrementLengthBy``` as follows instead:
     * ```ts
     * ctx.incrementLengthBy( appendedBitStream.length )
     * ```
     */
    updateWithBitStreamAppend( appendedBitStream: Readonly<BitStream> ): void
    {
        this.incrementLengthBy( appendedBitStream.length )
    }
}