import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pConstrToData, peqInt, pfstPair, pif, pnilData, punConstrData } from "../Prelude/Builtins";
import TermBool from "../Prelude/UtilityTerms/TermBool";
import PType, { PDataRepresentable } from "../PType";
import { plet } from "../Syntax";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PData from "./PData";
import { pInt } from "./PInt";
import pstruct from "./PStruct";

export const PDBool = pstruct({
    True: {},
    False: {}
})

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
    static override toData(term: Term<PBool>): Term<PData>
    {
        return  pif( Type.Data.Constr ).$( term )
            // 'pnilData' is an hoisted term; no need to 'plet'
            .then( pConstrToData.$( pInt( 0 ) ).$( pnilData ) )
            .else( pConstrToData.$( pInt( 1 ) ).$( pnilData ) )
    }
}



export function pBool( bool: boolean ): Term<PBool>
{
    return new Term<PBool>(
        Type.Bool,
        _dbn => UPLCConst.bool( bool ),
        true
    );
}