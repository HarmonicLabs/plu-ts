import PType from "../../PType";
import PBool, { pBool } from "../../PTypes/PBool";
import PFn from "../../PTypes/PFn/PFn";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt, { pInt } from "../../PTypes/PInt";
import PList, { pnil } from "../../PTypes/PList";
import { papp, perror, pfn, phoist, plam, plet, precursive } from "../../Syntax/syntax";
import Term from "../../Term";
import Type, { bool, ConstantableTermType, fn, lam, list, PrimType, TermType, ToPType, tyVar } from "../../Term/Type/base";
import { pand, pchooseList, phead, pif, pisEmpty, plessInt, por, pprepend, pstrictIf, ptail } from "../Builtins";
import { pflip } from "../PCombinators";
import PMaybe, { PMaybeT } from "../PMaybe/PMaybe";


export function pmatchList<ReturnT  extends TermType, PElemsT extends PType = PType>( returnT: ReturnT, elemsT: TermType = tyVar("elemsT_pmatchList") )
    : TermFn<[ PElemsT, PLam<PElemsT,PLam<PList<PElemsT>, ToPType<ReturnT>>>, PList<PElemsT> ], ToPType<ReturnT>>
{
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

export function precursiveList<ReturnT  extends TermType, ElemtsT extends TermType>( returnT: ReturnT, elemsT: ElemtsT = tyVar("elemsT_precursiveList") as any )
    : TermFn<
        [
            PLam< // caseNil
                PLam<PList<ToPType<ElemtsT>>, ToPType<ReturnT>>, // self
                ToPType<ReturnT> // result for nil
            >,
            PLam< // caseCons
                PLam<PList<ToPType<ElemtsT>>, ToPType<ReturnT>>, // self
                PLam< ToPType<ElemtsT>, PLam<PList<ToPType<ElemtsT>>,ToPType<ReturnT>>> // x xs -> result for cons
            >,
            PList<ToPType<ElemtsT>> // list
        ],
        ToPType<ReturnT> // result
    >
{
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
            ( ( self, matchNil, matchCons, lst ) => 
                plet( 
                    papp(
                        papp(
                            self,
                            matchNil
                        ),
                        matchCons
                    )
                ).in( finalSelf =>
                    pmatchList( returnT, elemsT )
                    .$(
                        papp(
                            matchNil,
                            finalSelf
                        )
                    )
                    .$(
                        papp(
                            matchCons,
                            finalSelf
                        )
                    )
                    .$( lst )
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

                    pif( elemsT ).$(
                        por
                        .$( pisEmpty.$( list ) )
                        .$( 
                            plessInt.$( idx ).$( pInt( 0 ) ) 
                        ) 
                    )
                    .then( perror( elemsT, "pindexList" ) )
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

export function pfind<ElemsT extends ConstantableTermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
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

/**
 * @deprecated use `pfind` instead
**/
export const pfindList = pfind;

export function pfoldr<ElemsT extends ConstantableTermType, ResultT extends ConstantableTermType>( elemsT: ElemsT, resultT: ResultT )
    : TermFn<[
        PFn<[ ToPType<ElemsT>, ToPType<ResultT> ], ToPType<ResultT>>,
        ToPType<ResultT>,
        PList<ToPType<ElemsT>>
    ],  ToPType<ResultT>>
{
    const a = elemsT;
    const b = resultT;
    
    const selfType = lam( list( elemsT ), resultT );

    return phoist(
        pfn([
            fn([ a, b ], b ),
            b
        ],  lam( list( a ), b ))
        (( reduceFunc, accumulator ) => {

            return precursiveList( resultT, elemsT )
            .$(
                plam( selfType , resultT )
                ( _foldr => accumulator )
            )
            .$(
                pfn([
                    selfType,
                    elemsT,
                    list( elemsT )
                ],  resultT )
                (( self, head, tail ) =>

                    // compute new result using the result got
                    // AFTER the recursive call on the rest of the list
                    // and the first element of the list
                    papp(
                        reduceFunc,
                        head
                    ).$(
                        papp(
                            self,
                            tail
                        )
                    )
                )
            ) as any
        })
    ) as any;
}

export function pfoldl<ElemsT extends ConstantableTermType, ResultT extends ConstantableTermType>( elemsT: ElemsT, resultT: ResultT )
    : TermFn<[
        PFn<[ ToPType<ResultT>, ToPType<ElemsT> ], ToPType<ResultT>>,
        ToPType<ResultT>,
        PList<ToPType<ElemsT>>
    ],  ToPType<ResultT>>
{
    const a = elemsT;
    const b = resultT;
    
    const recursivePartType = fn([
        b,
        list( a )
    ],  b);

    return phoist(
        plam(
            fn([ b, a ], b ),
            recursivePartType
        )
        (( reduceFunc ) =>

            precursive(
                pfn([
                    recursivePartType,
                    b
                ],  lam( list( a ), b ))
                (( self, accum ) => 

                    pmatchList( b, a )
                    .$( accum )
                    .$(
                        pfn([ a, list( a ) ], b )
                        (( head, tail ) =>
                            papp(
                                papp(
                                    self,
                                    // compute new accumulator
                                    // BEFORE the rest of the list
                                    papp(
                                        reduceFunc,
                                        accum
                                    ).$(
                                        head
                                    )
                                ),
                                tail
                            ) as any
                        )
                    ) as any
                    // .$( lst )
                )
            ) as any

        )
    ) as any;
}

export function preverse<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
    : TermFn<[ PList<ToPType<ElemsT>> ], PList<ToPType<ElemsT>>>
{
    return phoist(
        pfoldl( elemsT, list( elemsT ) )
        .$( pflip.$( pprepend( elemsT ) ) )
        .$( pnil( elemsT ) )
    )
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
        )(( predicate ) => 
            
            pfoldr( elemsT, list( elemsT ) )
            .$(
                pfn([
                    elemsT,
                    list( elemsT )
                ],  list( elemsT ))
                (( elem, accum ) =>
                    pif( list(elemsT) ).$( papp( predicate, elem ) )
                    .then( accum.prepend( elem ) )
                    .else( accum )
                )
            ).$( pnil( elemsT ) )
            // .$( lst )

        )
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

            /*

            it is possible to define `pevery` in terms of `pfoldl`
            however `pfoldl` traverses the entire list no matter what
            
            instead it should be possible to immidiatelly return if `pBool(true)` is found

            the current implementation traverses the list too;
            because the arguments are evaluated before being passed to  `pand`


            return pfoldl( elemsT, bool )
            .$(
                pflip.$(
                    plam( elemsT, lam( bool, bool ) )
                    ( elem => 
                        pand.$( papp( predicate, elem ) )
                    )
                )
            )
            .$( pBool( true ) )
            */

            return precursiveList( bool, elemsT )
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


export function psome<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
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

            return precursiveList( bool , elemsT )
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

                    por.$(
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

            return pfoldr( fromT, list( toT ) )
            .$(
                pfn([
                    fromT,
                    list( toT )
                ],  list( toT ))
                ( (elem, accum) =>
                    accum.prepend( papp( f, elem ) )
                ) 
            )
            .$( pnil( toT ) )
            // .$( _list )
        })
    ) as any;
}
