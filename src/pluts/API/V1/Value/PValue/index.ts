import { palias } from "../../../../PTypes/PAlias/palias";
import { pfstPair, psndPair } from "../../../../lib/builtins/pair";
import { pif } from "../../../../lib/builtins/bool";
import { pdelay } from "../../../../lib/pdelay";
import { pfn } from "../../../../lib/pfn";
import { phoist } from "../../../../lib/phoist";
import { pInt } from "../../../../lib/std/int/pInt";
import { _precursiveList } from "../../../../lib/std/list/precursiveList/minimal";
import { asData, delayed, fn, int, lam, list, pair } from "../../../../../type_system/types";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";
import { _papp } from "../../../../lib/std/data/conversion/minimal_common";
import { plam } from "../../../../lib/plam";

export const PAssetsEntry = palias(
    pair(
        PTokenName.type,
        int
    ),
    ( self_t ) => {

        return {
            tokenName: plam( self_t, PTokenName.type )( self => self.fst ),
            quantity:  plam( self_t, int )( self => self.snd ),
        }
    }
);

export const PValueEntry = palias(
    pair(
        PCurrencySymbol.type,
        list( PAssetsEntry.type )
    ),
    ( self_t ) => {

        return {
            policy: plam( self_t, PCurrencySymbol.type )( self => self.fst ),
            assets: plam( self_t, list( PAssetsEntry.type ) )( self => self.snd )
        };
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

                _papp(
                    _papp(
                        _papp(
                            _precursiveList( int, PValueEntry.type ),
                            plam( fn([ list(PValueEntry.type) ], int ), delayed( int ) )( _self => pdelay( pInt(0) ) )
                        ),
                        pfn([
                            fn([ list(PValueEntry.type) ], int ),
                            PValueEntry.type,
                            list( PValueEntry.type )
                        ],  int)
                        ((self, head, tail ) =>
                        pif( int ).$( head.policy.eq( currSym ) )
                        .then(
    
                            _papp(
                                _papp(
                                    _papp(
                                        _precursiveList( int, PAssetsEntry.type ),
                                        plam( fn([ list(PAssetsEntry.type) ], int ), delayed( int ) )
                                        ( _self => pdelay( pInt(0) ) )
                                    ),
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
                                ),
                                head.snd
                            )
                        )
                        .else( self.$( tail ) as any ))
                    ),
                    value
                )
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


