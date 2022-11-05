import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pfstPair, psndPair, pisEmpty, pif, punConstrData, pConstrToData } from "../stdlib/Builtins";
import { PDataRepresentable } from "../PType";
import { perror, phoist, plam, plet } from "../Syntax/syntax";
import Term from "../Term";
import Type, { data, TermType, unit } from "../Term/Type/base";
import { pInt } from "./PInt";
import PData from "./PData/PData";
import PLam from "./PFn/PLam";
import { pDataList } from "./PList";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import DataConstr from "../../../types/Data/DataConstr";

export const pmakeUnit = () => new Term<PUnit>(
    Type.Unit,
    _dbn => UPLCConst.unit
);

export const pmakeUnitData = () => new Term<PData>(
    data,
    _dbn => new HoistedUPLC(
        UPLCConst.data(
            new DataConstr( 0, [] )
        )
    )
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

    static override get fromDataTerm(): Term<PLam<PData, PUnit>> & { $: (input: Term<PData>) => Term<PUnit>; }
    {
        return phoist(
            plam( Type.Data.Any, Type.Unit )(
                ( data: Term<PData> ): Term<PUnit> => 
                    plet( punConstrData.$( data ) ).in(
                        idxListPair => {

                            const pfst = pfstPair( Type.Int, Type.List( Type.Data.Any ) );
                            const psnd = psndPair( Type.Int, Type.List( Type.Data.Any ) );

                            return pif( Type.Unit )
                                .$(
                                    pInt( 0 )
                                    .eq.$(
                                        pfst.$( idxListPair )
                                    )
                                    .and.$(
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
        )
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static override get fromData(): (data: Term<PData>) => Term<PUnit> {
        return ( _data: Term<PData> ): Term<PUnit> => PUnit.fromDataTerm.$( _data )
        
    }

    static override get toDataTerm(): Term<PLam<PUnit, PData>> & { $: (input: Term<PUnit>) => Term<PData>; }
    {
        return phoist(
            plam( unit, data )(
                _unit => pConstrToData.$( pInt( 0 ) ).$( pDataList([]) ) 
            )
        );
    }

    static override toData(term: Term<PUnit>): Term<PData>
    {
        return PUnit.toDataTerm.$( term );
    }
}