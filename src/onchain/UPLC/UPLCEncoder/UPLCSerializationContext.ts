import BitStream from "../../../types/bits/BitStream";

export interface RawUPLCSerializationContex
{
    currLength: number
}

export default class UPLCSerializationContex
{
    private _rawCtx: RawUPLCSerializationContex;
    
    constructor( rawCtx: RawUPLCSerializationContex )
    {
        this._rawCtx = rawCtx;
    }

    get currLength(): number
    {
        return this._rawCtx.currLength;
    }

    updateWith( updatedFields: Partial< RawUPLCSerializationContex > ): void
    {
        this._rawCtx = {
            ...this._rawCtx,
            ...updatedFields
        }
    }

    incrementLengthBy( n: number ): void
    {
        this.updateWith({
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