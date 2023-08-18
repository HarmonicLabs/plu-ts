import { palias } from "../../../../PTypes/PAlias/palias";
import { pfstPair, psndPair } from "../../../../lib/builtins/pair";
import { pif } from "../../../../lib/builtins/bool";
import { pdelay } from "../../../../lib/pdelay";
import { pfn } from "../../../../lib/pfn";
import { phoist } from "../../../../lib/phoist";
import { pInt } from "../../../../lib/std/int/pInt";
import { precursiveList } from "../../../../lib/std/list/precursiveList";
import { fn, int, list, pair } from "../../../../type_system/types";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";

export const PAssetsEntry = palias(
    pair(
        PTokenName.type,
        int
    ),
    ( _self_t ) => {

        return {
            tokenName: pfstPair( PTokenName.type, int ),
            quantity:  psndPair( PTokenName.type, int ),
        }
    }
);

export const PValueEntry = palias(
    pair(
        PCurrencySymbol.type,
        list( PAssetsEntry.type )
    ),
    ( _self_t ) => {

        return {
            policy: pfstPair( PCurrencySymbol.type, list( PAssetsEntry.type ) ),
            assets: psndPair( PCurrencySymbol.type, list( PAssetsEntry.type ) )
        }
    }
)

export const PValue = palias(
    list( PValueEntry.type ),
    ( self_t ) => {

        const pvalueOf = phoist(
            pfn([
                self_t,
                PCurrencySymbol.type,
                PTokenName.type
            ],  int)
            (( value, currSym, tokenName ) =>
                precursiveList( int, PValueEntry.type )
                .$( _self => pdelay( pInt(0) ) )
                .$( 
                    pfn([
                        fn([ list(PValueEntry.type) ], int ),
                        PValueEntry.type,
                        list( PValueEntry.type )
                    ],  int)
                    ((self, head, tail ) =>
                    pif( int ).$( head.policy.eq( currSym ) )
                    .then(

                        precursiveList( int, PAssetsEntry.type )
                        .$( _self => pdelay( pInt(0) ) )
                        .$(
                            pfn([
                                fn([ list(PAssetsEntry.type) ], int ),
                                PAssetsEntry.type,
                                list( PAssetsEntry.type )
                            ],  int)
                            (
                                (self, head, tail) =>
                                pif( int ).$( head.fst.eq( tokenName ) )
                                .then( head.snd )
                                .else( self.$( tail ) as any )
                            )
                        )
                        .$( head.snd )
                    )
                    .else( self.$( tail ) as any ))
                )
                .$( value )
            )
        );

        return {
            amountOf: pvalueOf,
            lovelaces:
                pfn([ self_t ], int)
                ( value => 
                    pvalueOf.$( value ).$("").$("") 
                )
        }
    }
);


