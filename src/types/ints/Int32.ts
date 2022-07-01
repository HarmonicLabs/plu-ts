import Debug from "../../utils/Debug";
import JsRuntime from "../../utils/JsRuntime";


/**
 * javascript, memory efficient **signed** int32 representation
 * 
 * useful documentation:
 * 
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR#description
 */
export default class Int32
{
    private _int : number;
    static toInt32Num( n: number ): number
    {
        return n | 0;
    }

    static isInt32( n : number )
    {
        return ( 
            n === Int32.toInt32Num( n )
        );
    }
    /**
     * to check if it is safe to construct an ```Int32``` instance using a given numebr use
     * ```ts
     * Int32.isInt32( number );
     * ```
     * 
     * @param {number} int a number that will be made absolute, rounded and truncated if greather than (2^31 - 1)
     */
    constructor( int: number )
    {
        JsRuntime.assert(
            Int32.isInt32( int ),
            "trying to construct a Int32 instance using " + int.toString() + " as input. keep in mind",
            new Debug.AddInfos({
                input: int,
                asInt32: Int32.toInt32Num( int ),
                inputBinary: int.toString(2),
                asInt32Binary: Int32.toInt32Num( int ).toString(2)
            })
        );

        this._int = Int32.toInt32Num( int );
    }

}