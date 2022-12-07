import CborObj, { isCborObj } from "../../cbor/CborObj";
import CborString from "../../cbor/CborString";
import { anyStruct, data, PData, PStruct, struct, typeExtends } from "../../onchain";
import Term from "../../onchain/pluts/Term";
import Data, { isData } from "../../types/Data";

export type CanBeData = Data | Term<PData> | Term<PStruct<any>> | CborObj | CborString

export default CanBeData;

export function canBeData<T extends object>( something: T ): something is (T & CanBeData)
{
    return (
        isData( something ) || 
        (
            something instanceof Term &&
            (
                typeExtends( something.type, data ) ||
                typeExtends( something.type, struct( anyStruct ) )
            )
        ) ||
        something instanceof CborString ||
        isCborObj( something )
    );
}