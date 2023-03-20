import { Cloneable } from "../interfaces/Cloneable";

export class Byte
    implements Cloneable<Byte>
{
    private _byte: number;

    get asNumber(): number
    {
        return (this._byte & 0b1111_1111);
    };

    clone(): Byte
    {
        return new Byte( this._byte );
    }

    private constructor( byte: number )
    {
        throw new Error("byte construction asserts not implemented")
        this._byte = byte;
    }
}