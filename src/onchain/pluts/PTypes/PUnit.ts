import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pfstPair, psndPair, pisEmpty, pif, punConstrData } from "../Prelude/Builtins";
import { PDataRepresentable } from "../PType";
import { perror, phoist, plam, plet } from "../Syntax";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import { pInt } from "./PInt";
import PData from "./PData";

export const pmakeUnit = () => new Term<PUnit>(
    Type.Unit,
    _dbn => UPLCConst.unit
);

export default class PUnit extends PDataRepresentable
{
    private _unit: undefined

    constructor()
    {
        super();
        this._unit = undefined;
    }

    static override get termType(): TermType { return Type.Unit };
    static override get fromData(): (data: Term<PData>) => Term<PUnit> {
        return ( _data: Term<PData> ): Term<PUnit> =>
            phoist(
                plam( Type.Data.Any, Type.Unit )(
                    ( data: Term<PData> ): Term<PUnit> => 
                        plet( punConstrData.$( data ) ).in(
                            idxListPair => {

                                const pfst = pfstPair( Type.Int, Type.List( Type.Data.Any ) );
                                const psnd = psndPair( Type.Int, Type.List( Type.Data.Any ) );

                                return pif( Type.Unit )
                                    .$(
                                        pInt( 0 )
                                        .eq(
                                            pfst.$( idxListPair )
                                        )
                                        .and(
                                            pisEmpty.$(
                                                psnd.$( idxListPair )
                                            )
                                        )
                                    )
                                    .then( pmakeUnit() )
                                    .else( perror( Type.Unit ) )
                            }
                        )
                )
            ).$( _data )
        
    }
}