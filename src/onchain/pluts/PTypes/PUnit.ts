import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { peqInt, pfstPair, psndPair, pisEmpty, pif, punConstrData } from "../Prelude/Builtins";
import PType from "../PType";
import { perror, plet } from "../Syntax";
import Term from "../Term";
import Type, { Type as Ty } from "../Term/Type";
import PInt, { pInt } from "./PInt";
import PData from "./PData";
import PList from "./PList";
import PPair from "./PPair";

const pUnit = new Term<PUnit>(
    Type.Unit,
    _dbn => UPLCConst.unit
);

export default class PUnit extends PType
{
    private _unit: undefined

    constructor()
    {
        super();
        this._unit = undefined;
    }

    static override get termType(): Ty { return Type.Unit };
    static override get fromData(): (data: Term<PData>) => Term<PUnit> {
        return ( data: Term<PData> ): Term<PUnit> => 
            plet<PUnit, PPair<PInt, PList<PData>>>( punConstrData.$( data ) ).in(
                idxListPair => {

                    const pfst = pfstPair( Type.Int, Type.List( Type.Data.Any ) );
                    const psnd = psndPair( Type.Int, Type.List( Type.Data.Any ) );

                    return pif( Type.Unit )
                        .$(
                            peqInt
                            .$( pfst.$( idxListPair ) )
                            .$( pInt( 0 ) )
                            .and(
                                pisEmpty.$(
                                    psnd.$( idxListPair )
                                )
                            )
                        )
                        .then( pUnit )
                        .else( perror( Type.Unit ) )

                }
                    
            )
        
    }
}