import Cloneable from "../../../types/interfaces/Cloneable";
import Hash from "../Hash";
import Hash32 from "./Hash32";

export default class AuxiliaryDataHash extends Hash32
    implements Cloneable<AuxiliaryDataHash>
{

    clone(): AuxiliaryDataHash
    {
        return new AuxiliaryDataHash( this );
    }
};