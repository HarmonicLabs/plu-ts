import { PData } from "./PData";
import { DataB } from "../../../../types/Data/DataB";
import { ByteString } from "../../../../types/HexString/ByteString";

export class PDataBS extends PData // (PData extends PType => PDataBS extends PType too)
{
    constructor( bs: ByteString | Buffer = Buffer.from([]) )
    {
        super( new DataB( bs ) );
    }
}