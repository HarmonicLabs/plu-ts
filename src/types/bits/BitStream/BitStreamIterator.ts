import Debug from "../../../utils/Debug";
import Bit, { InByteOffset } from "../Bit";
import BitStream from "../BitStream";


export default class BitStreamIterator
{
    private _bitStreamBuff: Buffer;
    private _nZeroesAsPadding: InByteOffset

    private _currByteIndex: number;
    private _currByte: number;
    private _currBitIndex: InByteOffset;

    constructor( bitStream: Readonly<BitStream> )
    {
        const { buffer, nZeroesAsEndPadding } = bitStream.toBuffer();
        
        this._bitStreamBuff = buffer;
        this._nZeroesAsPadding = nZeroesAsEndPadding;

        this._currByteIndex = 0;
        this._currByte = this._bitStreamBuff.readUint8( this._currByteIndex );
        this._currBitIndex = 0;

        this._updateByte = this._updateByte.bind(this);
        this._isDone = this._isDone.bind(this);
    }

    next(): {
        done: boolean
        value?: Bit 
    }
    {
        if( this._isDone() ) return { done: true };

        /*
        Debug.ignore.log(
            `currByte: ${this._currByte.toString(2).padStart( 8 , '0' )}`,
            `\nmask    : ${( 0b1 << ( 7 - this._currBitIndex ) ).toString(2).padStart( 8 , '0' )}`,
            `\nresult  : ${( 
                this._currByte & 
                ( 0b1 << ( 7 - this._currBitIndex ) ) 
            ).toString(2).padStart( 8 , '0' )}`
        )
        //*/

        // get value
        const value = new Bit(
            Boolean( 
                this._currByte & 
                ( 0b1 << ( 7 - this._currBitIndex ) ) 
            )
        )

        // perform update for next call
        this._currBitIndex++;

        if( this._currBitIndex >= 8 )
        {
            this._currBitIndex = 0;

            this._updateByte();
        }

        // yeilds value
        return {
            value,
            done: false
        }
    }

    private _updateByte(): void
    {
        this._currByteIndex++;

        if(this._currByteIndex < this._bitStreamBuff.length )
        {
            this._currByte = this._bitStreamBuff.readUint8( this._currByteIndex );
        }
    }

    private _isDone(): boolean
    {
        return (
            (this._currByteIndex >= this._bitStreamBuff.length) ||
            (
                (this._currByteIndex === this._bitStreamBuff.length - 1) &&
                (
                    this._currBitIndex === ( 8 - this._nZeroesAsPadding )
                )
            )
        );
    }

}