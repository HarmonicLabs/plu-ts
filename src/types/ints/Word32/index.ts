import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";
import Cloneable from "../../interfaces/Cloneable";
import Int32 from "../Int32";


/**
 * like ```Int32``` but whit byte-oriented methods 
 * 
 * internally a javascript **signed** int32
 * 
 */
export default class Word32
    implements Cloneable<Word32>
{
    private _word : number;

    /**
     * to check if it is safe to construct an ```Int32``` instance using a given numebr use
     * ```ts
     * Int32.isInt32( number );
     * ```
     * 
     * @param {number} int a number that will be made absolute, rounded and truncated if greather than (2^31 - 1)
     */
    constructor( int: Readonly<number> )
    {
        JsRuntime.assert(
            Int32.isInt32( int ),
            "trying to construct a Word32 instance using " + int.toString() + " as input. keep in mind that Word32 is a **signed** integer internally",
            new Debug.AddInfos({
                input: int,
                asInt32: Int32.toInt32Num( int ),
                inputBinary: int.toString(2),
                asInt32Binary: Int32.toInt32Num( int ).toString(2)
            })
        )

        this._word = int | 0;
    }

    toInt32(): Int32
    {
        return new Int32( this._word );
    }

    byteAt( index: 0 | 1 | 2 | 3 ): number
    {
        // rounds
        index = Math.round( index ) as (0 | 1 | 2 | 3);
        // ensure valid index
        index = index < 0 ? 0 : ( index > 3 ? 3 : index );

        /*
        byteAt(3) -> (this._word & 0b11111111_00000000_00000000_00000000) >> ( 8 * 3 )
        byteAt(2) -> (this._word & 0b00000000_11111111_00000000_00000000) >> ( 8 * 2 )
        byteAt(1) -> (this._word & 0b00000000_00000000_11111111_00000000) >> ( 8 * 1 )
        byteAt(0) -> (this._word & 0b00000000_00000000_00000000_11111111)
        */
        return ( 
            (
                (
                    this._word & 
                    ( // select bits
                        0b1111_1111 << 
                        ( 8 * index ) 
                    )
                )
                >> // bring them to the first byte
                (
                    8 * 
                    (3 - index) 
                )
            ) 
        );
    }

    asUInt8Array(): Uint8Array
    {
        return new Uint8Array([
            (this._word & 0b11111111_00000000_00000000_00000000) >> ( 8 * 3 ),
            (this._word & 0b00000000_11111111_00000000_00000000) >> ( 8 * 2 ),
            (this._word & 0b00000000_00000000_11111111_00000000) >> ( 8 * 1 ),
            (this._word & 0b00000000_00000000_00000000_11111111),
        ]) 
    }

    asBuffer(): Buffer
    {
        return Buffer.from( this.asUInt8Array() );
    }

    clone(): Word32
    {
        return new Word32( this._word );
    }
}