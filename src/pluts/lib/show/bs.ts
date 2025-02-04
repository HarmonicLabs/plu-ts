import { bs, fn, int } from "../../../type_system/types";
import { pif, ptrace } from "../builtins";
import { pfn } from "../pfn";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { precursive } from "../precursive";
import { punsafeConvertType } from "../punsafeConvertType";
import { pByteString } from "../std";
import { pdigitToString } from "./int";


export const phexDigit = phoist(
    plam( int, bs )
    ( n =>
        pif( bs ).$( n.lt( 10 ) )
        .then( pdigitToString.$( n ) )
        .else( pByteString("").prepend( n.add(87) ) )
    )
);

export const phexByte = phoist(
    plam( int, bs )
    ( byte => phexDigit.$( byte.div(16) ).concat( phexDigit.$( byte.mod( 16 ) ) ) )
);

export const pbsToHex = phoist(
    pfn([ bs ], bs)
    ( b => 
        precursive(
            pfn([
                fn([ int ], bs ),
                int
            ],  bs)
            ( (_self, i ) => {
    
                const self = punsafeConvertType( _self, fn([ int ], bs ) );
    
                return pif( bs ).$( i.gtEq( b.length ) )
                .then( pByteString("") )
                .else(
                    phexByte.$( b.at( i ) )
                    .concat(
                        self.$( i.add(1) )
                    )
                )
            })
        ).$( 0 ) 
    )
);

export const pshowBs = pbsToHex;

export const ptraceBs = phoist(
    plam( bs, bs )
    ( b => ptrace( bs ).$( pbsToHex.$( b ).utf8Decoded ).$( b ) )

) 