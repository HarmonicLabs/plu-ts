import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { pif } from "../builtins/bool";
import { bs, int, lam } from "../../../type_system/types";
import { phoist } from "../phoist";
import { pfn } from "../pfn";
import { plam } from "../plam";
import { precursive } from "../precursive";
import { punsafeConvertType } from "../punsafeConvertType";
import { pByteString, pInt } from "../std";

export const pdigitToString = phoist(
    pfn([
        int
    ],  bs)
    (  n => pByteString("").prepend( n.add(48) ) )
);

export const ppositiveIntToBs = phoist(
    precursive(
        pfn([
            lam( int, bs ),
            int
        ],  bs)
        (( _self, n ) => {

            const self = punsafeConvertType( _self, lam( int, bs ) );

            return pif( bs ).$( n.gtEq( 10 ) )
            .then( self.$( n.div(10) ).concat( pdigitToString.$( n.mod(10) ) ) )
            .else( pdigitToString.$( n ) );
        })
    )
);

export const pshowInt = phoist(
    plam( int, bs )
    ( n => 
        pif( bs ).$( n.gtEq( 0 ) )
        .then( ppositiveIntToBs.$( n ) )
        .else( 
            pByteString(fromAscii("-")).concat( 
                ppositiveIntToBs.$( 
                    pInt( 0 ).sub( n ) 
                ) 
            ) 
        ) 
    )
);