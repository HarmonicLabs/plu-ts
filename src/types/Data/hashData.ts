import Data, { isData } from ".";
import { blake2b_256, byte } from "../../crypto";
import BasePlutsError from "../../errors/BasePlutsError";
import dataToCbor from "./toCbor";

export default function hashData( data: Data ): byte[]
{
    if( !isData( data ) )
    throw new BasePlutsError(
        "hashData only works with Data"
    );

    return blake2b_256( dataToCbor( data ).asBytes )
}