import BufferUtils from "../../utils/BufferUtils";
import Cloneable from "../interfaces/Cloneable";
import Word32 from "../ints/Word32";
import { InByteOffset, isInByteOffset } from "./Bit";
import Word32List from "./Word32List";

/**
 * defaults to
 * ```js
 * {
 *     startOffset: 0,
 *     endOffset: undefined
 * }
 * ```
 * 
 * if ```startOffset``` is provided becomes
 * 
 * ```js
 * {
 *     startOffset: startOffset,
 *     endOffset: undefined
 * }
 * ```
 * 
 * if only ```endOffset``` is provided becomes
 * ```js
 * {
 *     startOffset: undefined,
 *     endOffset: endOffset
 * }
 * ```
 * 
 * if both ```startOffset``` and ```endOffset``` are provided becomes
 * ```js
 * {
 *     startOffset: startOffset,
 *     endOffset: undefined
 * }
 * ```
 */
export interface BitStreamConstructorOptions
{
    /**
     * if provided will try to construct the ```BitStream``` instance with ```startOffset``` bits from the start setted to 0 and marked as undefined
     * 
     * if not provided checks for ```endOffset```, if ```endOffset``` is undefined or missing ```startOffset``` defaults to 0
     */
    startOffset?: InByteOffset
    /**
     * if ```startOffset``` is not provided will try to construct the ```BitStream``` instance
     * with ```endOffset``` bits form the end settet to zero and marked as unused
     * 
     * if not provided ```startOffset``` defaults to ```0``` and ```endOffset``` to ```undefined```
     */
    endOffset?: InByteOffset
}

/**
 * bit orienetd buffer, doesn't cares about bytes
 * 
 * we could use ```bigint``` as representation as it should be better also from the performance side
 * 
 * but using a duble linked list is more practical
 */
export default class BitStream
    implements Cloneable<BitStream>
{
    private _chunks: Word32List

    /*
    the tracked bits do not have to fit in a byte, that is why whe need to track the offset

    we track two offste (start and end) because it MAY turn more efficient with BitStreams concatenation,
    
    concatenation is an operation that maight be executed often when concsturcting a flat-serialized UPLC program
    */
    private _startOffset: InByteOffset;
    private _endOffset: InByteOffset;

    private _leftUnusedByets : 0 | 1 | 2 | 3 | 4;
    private _rightUnisedBytes: 0 | 1 | 2 | 3 | 4;

    private constructor( 
        buffer: Buffer | Word32List , 
        {
            startOffset: _startOffset,
            endOffset: _endOffset
        } : BitStreamConstructorOptions = {}
    )
    {
        let startOffset : InByteOffset | undefined = _startOffset === undefined ? ( _endOffset === undefined ? 0 : undefined) : _startOffset ;
        let endOffset   : InByteOffset | undefined = _startOffset !== undefined ? _endOffset : undefined; 
    }

    clone(): BitStream
    {
        const bitStream : BitStream =  new BitStream( 
            new Word32List({
                chunk: new Word32( 0 ),
                prev: null,
                next: null
            })
        );

        bitStream._chunks = this._chunks.clone();
        bitStream._startOffset = this._startOffset;
        bitStream._endOffset = this._endOffset;

        return bitStream;
    }

    private _parseShiftOffset( offset: number, opposite: ( offset: number ) => void ) : { offset: InByteOffset , shouldProceed: boolean }
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
            offset: offset as InByteOffset,
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