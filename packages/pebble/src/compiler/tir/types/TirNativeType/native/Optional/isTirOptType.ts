import { TirType } from "../../../TirType";
import { TirDataOptT } from "./data";
import { TirSopOptT } from "./sop";

export function isTirOptType( t: any ): t is TirDataOptT<TirType> | TirSopOptT<TirType>
{
    return (
        t instanceof TirDataOptT
        || t instanceof TirSopOptT
    );
}