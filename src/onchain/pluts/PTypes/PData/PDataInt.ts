import { PData } from "./PData";
import { DataI } from "../../../../types/Data/DataI";
import { Integer } from "../../../../types/ints/Integer";

export class PDataInt extends PData
{
    constructor( int: number | bigint | Integer = 0 )
    {
        super( new DataI( int ) );
    }
}