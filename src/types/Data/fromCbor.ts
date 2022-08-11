import Data from ".";
import CborObj from "../../cbor/CborObj";
import CborString from "../../cbor/CborString";


export function dataFromCborObj( cborObj: CborObj ): Data
{

}

export default function dataFromCbor( cbor: CborString ): Data
{
    return dataFromCborObj( cbor.toCborObj() );
}