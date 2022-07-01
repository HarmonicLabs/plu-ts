import BufferUtils from "../../utils/BufferUtils";
import Cloneable from "../interfaces/Cloneable";
import { BitOffset, isBitOffset } from "./Bit";

export interface BitStreamConstructorOptions
{
    startOffset?: BitOffset
    endOffset?: BitOffset
}

/**
 * bit orienetd buffer, doesn't cares about bytes
 */
export default class BitStream
    implements Cloneable<BitStream>
{
    private _buffer: Buffer

    /*
    the tracked bits do not have to fit in a byte, that is why whe need to track the offset

    we track two offste (start and end) because it MAY turn more efficient with BitStreams concatenation,
    
    concatenation is an operation that maight be executed often when concsturcting a flat-serialized UPLC program
    */
    private _startOffset: BitOffset;
    private _endOffset: BitOffset;

    private constructor( 
        buffer: Buffer , 
        {
            startOffset,
            endOffset
        } : BitStreamConstructorOptions
    )
    {
        this._buffer = buffer;

        startOffset = startOffset ?? 0;
        endOffset   = endOffset   ?? 0;

        this._startOffset = isBitOffset(startOffset) ? startOffset : 0;
        this._endOffset   = isBitOffset(endOffset)   ? endOffset   : 0; 
    }

    clone(): BitStream
    {
        return new BitStream( BufferUtils.copy( this._buffer ) , { startOffset : this._startOffset, endOffset: this._endOffset });
    }

    private _parseShiftOffset( offset: number, opposite: ( offset: number ) => void ) : { offset: BitOffset , shouldProceed: boolean }
    {
        if( offset < 0 )
        {
            opposite( -offset );
            return {
                offset: 0,
                shouldProceed: false
            };
        };

        offset = Math.round( Math.abs( offset ) ) % 8;
        
        if( offset == 0 ) return {
            offset: 0,
            shouldProceed: false
        };

        return {
            offset: offset as BitOffset,
            shouldProceed: true
        }
    }

    shiftr( _offset : number )
    {
        let { shouldProceed, offset } = this._parseShiftOffset( _offset, this.shiftl );
        if( !shouldProceed ) return;
    }

    shiftl( _offset : number )
    {
        let { shouldProceed, offset } = this._parseShiftOffset( _offset, this.shiftr );
        if( !shouldProceed ) return;


    }
}