import { InByteOffset } from "../../../types/bits/Bit";
import BitStream from "../../../types/bits/BitStream";
import Debug from "../../../utils/Debug";

export interface RawUPLCSerializationContex
{
    currLength: number
}

export class UPLCSerializationContex
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
        Debug.log( `${this._rawCtx.currLength} -> ${updatedFields.currLength}` )
        this._rawCtx = {
            ...this._rawCtx,
            ...updatedFields
        }
    }

    updateWithBitStreamAppend( appendedBitStream: Readonly<BitStream> ): void
    {
        this.updateWith({
            currLength: this._rawCtx.currLength + appendedBitStream.length
        })
    }
}

export function updateSerializationCtx(
    currentCtx: RawUPLCSerializationContex,
    updateWith: Partial< RawUPLCSerializationContex >
): RawUPLCSerializationContex
{
    return {
        ...currentCtx,
        ...updateWith
    };
}

export function getUpdatedCtxAfterAppend(
    currentContext: UPLCSerializationContex,
    appendedBitStream: BitStream 
)
{
    return updateSerializationCtx(
        currentContext,
        {
            currLength: currentContext.currLength + appendedBitStream.length
        }
    );
}

export default interface UPLCSerializable 
{
    toUPLCBitStream: ( ctx: UPLCSerializationContex ) => BitStream
}