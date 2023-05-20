import { PType } from "../../PType";
import { Term } from "../../Term";
import { LitteralPurpose } from "../LitteralPurpose";
import { getFnTypes } from "../Parametrized/getFnTypes";
import { BlueprintValidator } from "./types";

export function toBlueprintValidator(
    title: string,
    purpose: LitteralPurpose | LitteralPurpose[],
    validator: Term<PType>
): BlueprintValidator
{
    const t = validator.type;
    
    const tys = getFnTypes( t );

    const outT = tys[ tys.length - 1 ][0];

    if( (purpose === "spend" && tys.length < 4) || tys.length < 3 ) throw new Error("invalid term to be a validator");

    const paramsTys = purpose === "spend" ? tys.slice( 0, tys.length - 4 ) : tys.slice( 0, tys.length - 3 );

    return {
        title,
        redeemer: {
            schema: {
                
            }
        }
    }
}