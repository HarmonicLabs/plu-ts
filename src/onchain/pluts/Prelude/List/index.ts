import PType from "../../PType";
import PBool, { pBool } from "../../PTypes/PBool";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt, { pInt } from "../../PTypes/PInt";
import PList, { pnil } from "../../PTypes/PList";
import { papp, perror, pfn, phoist, plam, plet, precursive, punsafeConvertType } from "../../Syntax";
import Term from "../../Term";
import Type, { bool, ConstantableTermType, fn, lam, list, PrimType, TermType, ToPType } from "../../Term/Type";
import { pand, pchooseList, phead, pif, pisEmpty, pprepend, pstrictIf, ptail } from "../Builtins";
import PMaybe, { PMaybeT } from "../PMaybe";


export function pmatchList<ReturnT  extends TermType, PElemsT extends PType = PType>( returnT: ReturnT )
    : TermFn<[ PElemsT, PLam<PElemsT,PLam<PList<PElemsT>, ToPType<ReturnT>>>, PList<PElemsT> ], ToPType<ReturnT>>
{
    const elemsT = Type.Var("elemsT");
    return phoist(
        pfn([
                returnT,
                Type.Fn([ elemsT, Type.List( elemsT ) ], returnT ),
                Type.List( elemsT )
            ], 
            returnT 
        )
        ( ( matchNil, matchCons, list ) => pchooseList( elemsT, returnT ).$( list )
            .caseNil( matchNil )
            .caseCons(
                papp(
                    papp(
                        matchCons,
                        phead( elemsT ).$( list )
                    ),
                    ptail( elemsT ).$( list )
                ) as any
            )
        ) as any
    );
}

export function precursiveList<ReturnT  extends TermType, PElemsT extends PType = PType>( returnT: ReturnT )
    : TermFn<
        [
            PLam< // caseNil
                PLam<PList<PElemsT>, ToPType<ReturnT>>, // self
                ToPType<ReturnT> // result for nil
            >,
            PLam< // caseCons
                PLam<PList<PElemsT>, ToPType<ReturnT>>, // self
                PLam< PElemsT, PLam<PList<PElemsT>,ToPType<ReturnT>>> // x xs -> result for cons
            >,
            PList<PElemsT> // list
        ],
        ToPType<ReturnT> // result
    >
{
    const elemsT = Type.Var("elemsT");
    const finalType = lam( list( elemsT ), returnT );
    
    return phoist(
        precursive(
            pfn([
                    fn([
                        lam( finalType, returnT ),
                        fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                        list( elemsT )
                    ],  returnT ),
                    lam( finalType, returnT ),
                    fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                    list( elemsT )
                ], 
                returnT
            )
            // for some reason the Z combinators loops
            // if the `list` paramter is made implicit
            ( ( self, matchNil, matchCons, list ) => 
                plet( 
                    papp(
                        papp(
                            self,
                            matchNil
                        ),
                        matchCons
                    )
                ).in( finalSelf =>
                    pmatchList( returnT )
                    .$(
                        papp(
                            matchNil,
                            finalSelf
                        ) as any
                    )
                    .$(
                        papp(
                            matchCons,
                            finalSelf
                        )
                    )
                    .$( list )
                ) as any
            )
        )
    ) as any;
}

export function pindexList<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
    : TermFn<[ PList<ToPType<ElemsT>>, PInt ], ToPType<ElemsT>>
{
    return phoist(
        precursive<PList<ToPType<ElemsT>>, PLam<PInt,ToPType<ElemsT>>>(

            pfn(
                [
                    Type.Fn([ Type.List( elemsT ), Type.Int ], elemsT),
                    Type.List( elemsT ),
                    Type.Int
                ],
                elemsT
            )(
                ( self, list, idx ) => 

                    pif( elemsT ).$( pisEmpty.$( list ) )
                    .then( perror( elemsT ) )
                    .else(

                        pif( elemsT ).$( pInt( 0 ).eq( idx ) )
                        .then( phead( elemsT ).$( list ) as any )
                        .else(
                            papp(
                                papp(
                                    self,
                                    ptail( elemsT ).$( list )
                                ),
                                pInt( -1 ).add( idx )
                            ) as Term<ToPType<ElemsT>>
                        )

                    )
            )

        )
    )
}


export function pfindList<ElemsT extends ConstantableTermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
    : TermFn<[ PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{
    const PMaybeElem = PMaybe( elemsT ) as PMaybeT<PElemsT>;

    return phoist(
        precursive(
            pfn([
                fn([
                    lam( elemsT, bool ),
                    list( elemsT )
                ],  PMaybeElem.type ),
                lam( elemsT, bool ),
                list( elemsT )
            ],  PMaybeElem.type )
            (( self, predicate, _list ) => 
                pif( PMaybeElem.type ).$( pisEmpty.$( _list ) )
                .then( PMaybeElem.Nothing({}) )
                .else(
                    plet( phead( elemsT ).$( _list ) ).in( head => 
                        pif( PMaybeElem.type ).$( papp( predicate, head ) )
                        .then( PMaybeElem.Just({ val: head as any }))
                        .else( papp( papp( self, predicate) , ptail( elemsT ).$( _list ) ) )
                    )
                )
            )
        )
    ) as any;
}


export function pfilter<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
    : TermFn<[ PLam<ToPType<ElemsT>,PBool>, PList<ToPType<ElemsT>> ], PList<ToPType<ElemsT>>>
{
    return phoist(
        plam(
            lam( elemsT, bool ),
            lam(
                list( elemsT ),
                list( elemsT )
            )
        )(( predicate ) => {

            return precursiveList<[ PrimType.List, ElemsT], ToPType<ElemsT>>( list( elemsT ) )
            .$(
                plam( lam( list( elemsT ) ,list( elemsT ) ), list( elemsT ) )
                ( ( _self ) => pnil( elemsT ) )
            )
            .$(
                pfn([
                    lam( list( elemsT ),list( elemsT ) ),
                    elemsT,
                    list( elemsT )
                ],  list( elemsT ))
                (( self, head, rest ) =>

                    plet( papp( self, rest ) ).in( filteredRest => 
                        pstrictIf( list( elemsT ) ).$(
                            papp(
                                predicate,
                                head
                            )
                        )
                        .$( pprepend( elemsT ).$( head ).$( filteredRest ) )
                        .$( filteredRest )

                ))
            )
            // .$( _list )
        })
    ) as any;
}


export function pevery<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
    : TermFn<[ PLam<ToPType<ElemsT>,PBool>, PList<ToPType<ElemsT>> ], PBool>
{
    return phoist(
        plam(
            lam( elemsT, bool ),
            lam(
                list( elemsT ),
                bool
            )
        )(( predicate ) => {

            return precursiveList<[ PrimType.Bool ], ToPType<ElemsT>>( bool )
            .$(
                plam( lam( list( elemsT ), bool ), bool )
                ( ( _self ) => pBool( true ) )
            )
            .$(
                pfn([
                    lam( list( elemsT ), bool ),
                    elemsT,
                    list( elemsT )
                ],  bool )
                (( self, head, rest ) =>

                    pand.$(
                        papp(
                            predicate,
                            head
                        )
                    ).$(
                        papp(
                            self,
                            rest
                        )
                    )

                )
            )
            // .$( _list )
        })
    ) as any;
}

export function pmap<FromT extends ConstantableTermType, ToT extends ConstantableTermType>( fromT: FromT, toT: ToT )
    : TermFn<[ PLam<ToPType<FromT>, ToPType<ToT>>, PList<ToPType<FromT>> ], PList<ToPType<ToT>>>
{
    return phoist(
        plam(
            lam( fromT, toT ),
            lam(
                list( fromT ),
                list( toT )
            )
        )(( f ) => {

            return precursiveList( list( toT ) )
            .$(
                plam( lam( list( fromT ), list( toT ) ), list( toT ) )
                ( ( _self ) => pnil( toT ) )
            )
            .$(
                pfn([
                    lam( list( fromT ), list( toT ) ),
                    fromT,
                    list( fromT )
                ],  list( toT ) )
                (( self, head, rest ) =>

                    pprepend( toT )
                    .$( papp( f, head ) as Term<ToPType<ToT>> )
                    .$( papp( self, rest ) )

                )
            ) as any;
            // .$( _list )
        })
    ) as any;
}

export function _pmap<FromT extends ConstantableTermType, ToT extends ConstantableTermType>( fromT: FromT, toT: ToT )
    : TermFn<[ PLam<ToPType<FromT>, ToPType<ToT>>, PList<ToPType<FromT>> ], PList<ToPType<ToT>>>
{
    return phoist(
        precursive(
            pfn([
                fn([
                    lam( fromT, toT ),
                    list( fromT )
                ],  list( toT ) ),
                lam( fromT, toT ),
                list( fromT )
            ],  list( toT ) )
            ((self, f, _list) => 
            
                pif( list( toT ) ).$( pisEmpty.$( _list ) )
                .then( pnil( toT ) )
                .else(
                    pprepend( toT )
                    .$(
                        papp( f, phead( fromT ).$( _list ) ) as any
                    )
                    .$( 
                        papp( 
                            papp( self, f), 
                            ptail( fromT ).$( _list )
                        )
                    )
                )
            )
        )
    ) as any;
}