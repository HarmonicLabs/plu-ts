import { pappendStr, pdiv, pif, pmod } from "./Builtins";
import { pInt } from "../PTypes/PInt";
import { pStr } from "../PTypes/PString";
import { papp, pfn, phoist, plam, precursive } from "../Syntax";
import { int, lam, str } from "../Term/Type";

export const pintToStr = phoist(
    precursive(
        pfn([
            lam( int, str ),
            int
        ],  str)
        (( self, i ) => 
                   pif( str ).$( pInt(0).eq(i) ).then( pStr("0") )
            .else( pif( str ).$( pInt(1).eq(i) ).then( pStr("1") )
            .else( pif( str ).$( pInt(2).eq(i) ).then( pStr("2") )
            .else( pif( str ).$( pInt(3).eq(i) ).then( pStr("3") )
            .else( pif( str ).$( pInt(4).eq(i) ).then( pStr("4") )
            .else( pif( str ).$( pInt(5).eq(i) ).then( pStr("5") )
            .else( pif( str ).$( pInt(6).eq(i) ).then( pStr("6") )
            .else( pif( str ).$( pInt(7).eq(i) ).then( pStr("7") )
            .else( pif( str ).$( pInt(8).eq(i) ).then( pStr("8") )
            .else( pif( str ).$( pInt(9).eq(i) ).then( pStr("9") )
            .else( 
                pappendStr
                .$( papp( self, pdiv.$( i ).$( pInt(10) ) ))
                .$( papp( self, pmod.$( i ).$( pInt(10) ) )) 
            ))))))))))
        )
    )
) 