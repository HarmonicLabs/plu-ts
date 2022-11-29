import Term from "../Term";

import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PDataRepresentable from "../PType/PDataRepresentable";
import { pConstrToData, peqInt, pfstPair, pif, pnilData, punConstrData } from "../stdlib/Builtins";
import TermBool, { addPBoolMethods } from "../stdlib/UtilityTerms/TermBool";
import { phoist, plam } from "../Syntax/syntax";
import Type, { bool, data, TermType } from "../Term/Type/base";
import PData from "./PData/PData";
import PLam from "./PFn/PLam";
import { pInt } from "./PInt";

// circular ref
// import pstruct from "./PStruct";
// 
// export const PDBool = pstruct({
//     True: {},
//     False: {}
// })

//@ts-ignore
export default class PBool extends PDataRepresentable
    implements Cloneable< PBool >
{
    private _pbool: boolean

    constructor( bool: boolean = false )
    {
        super();
        this._pbool = bool;
    }

    clone(): PBool
    {
        return new PBool( this._pbool );
    }

    static override get termType(): TermType { return Type.Bool }
    static override get fromDataTerm(): Term<PLam<PData, PBool>> & { $: (input: Term<PData>) => Term<PBool>; }
    {
        return phoist(
            plam( data, bool )
            (( data: Term<PData> ): TermBool => {
                return peqInt
                    .$( 
                        pfstPair( Type.Int, Type.List( Type.Data.Any ) )
                        .$( punConstrData.$( data ) )
                    )
                    .$( pInt( 0 ) )
            })
        )
    }
    /**
     * @deprecated try to use 'fromDataTerm.$'
     */
    static override get fromData(): (data: Term<PData>) => TermBool {
        return ( data: Term<PData> ): TermBool => {
            return peqInt
                .$( 
                    pfstPair( Type.Int, Type.List( Type.Data.Any ) )
                    .$( punConstrData.$( data ) )
                )
                .$( pInt( 0 ) )
        }
    }

    static override get toDataTerm(): Term<PLam<PBool, PData>> & { $: (input: Term<PBool>) => Term<PData>; }
    {
        return phoist(
            plam( bool, data )
            ( b =>
                pif( Type.Data.Constr ).$( b )
                // 'pnilData' is an hoisted term; no need to 'plet'
                .then( pConstrToData.$( pInt( 0 ) ).$( pnilData ) )
                .else( pConstrToData.$( pInt( 1 ) ).$( pnilData ) )
            )
        )
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static override toData(term: Term<PBool>): Term<PData>
    {
        return  pif( Type.Data.Constr ).$( term )
            // 'pnilData' is an hoisted term; no need to 'plet'
            .then( pConstrToData.$( pInt( 0 ) ).$( pnilData ) )
            .else( pConstrToData.$( pInt( 1 ) ).$( pnilData ) )
    }
}

export function pBool( bool: boolean ): TermBool
{
    return addPBoolMethods(
        new Term<PBool>(
            Type.Bool,
            _dbn => UPLCConst.bool( bool ),
            true
        )
    );
}