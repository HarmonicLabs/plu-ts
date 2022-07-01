import BufferUtils from "../../utils/BufferUtils"

export default class Integer
{
    private _bytes: Buffer;

    private constructor( bytes: Buffer )
    {
        this._bytes = BufferUtils.copy( bytes );
    }
    
    toBytes(): Buffer
    {
        return BufferUtils.copy( this._bytes );
    }

    static fromBytes( bytes: Buffer ): Integer
    {
        return new Integer( bytes );
    }

    static isInteger( int: number ): boolean
    {

    }

    static fromNumber( int: number ): Integer
    {

    }

    static formBigInt( int: bigint ): Integer
    {

    }
}