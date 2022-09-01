import { peqInt, pif, plengthBs, punBData } from "../../Prelude/Builtins";
import TermBS from "../../Prelude/TermBS";
import TermInt from "../../Prelude/TermInt";
import PType from "../../PType";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PDataBS from "../../PTypes/PData/PDataBS";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt, { pInt } from "../../PTypes/PInt";
import { perror, plam, plet } from "../../Syntax";
import Term from "../../Term";

export type PDataTokenName = PDataBS

export class PTokenName extends PByteString
{
    static get fromData()
    : Term<PLam<PDataBS, PTokenName>> & {
        $: (dataBS: Term<PDataBS>) => Term<PTokenName> & TermBS;
    }
    { return punBData }
}

export type PDataCurrencySymbol = PDataBS
export const PDataCurrencySymbol = PDataBS

export class PCurrencySymbol extends PByteString
{
    static get fromData()
    : Term<PLam<PDataBS, PCurrencySymbol>> & {
        $: (dataBS: Term<PDataBS>) => Term<PCurrencySymbol> & TermBS;
    }
    {
        return plam( PDataCurrencySymbol, PCurrencySymbol )
            ( data  => plet< PByteString, TermBS, PCurrencySymbol >( PByteString, PCurrencySymbol )( punBData.$( data ) ).in(
                ( byteStr ) =>

                pif( PCurrencySymbol )
                .$( 
                    plet<PInt, TermInt, PBool>( PInt, PBool )
                    ( byteStr.length ).in( len =>
                            // CurrencySymbol length
                            len.eq( pInt( 28 ) ).or(
                                // Ada CurrencySymbol length
                                len.eq( pInt( 0 ) )
                            )
                    ) 
                )
                .then( byteStr )
                .else( perror( PCurrencySymbol ) )
            )) as any;
    }
}