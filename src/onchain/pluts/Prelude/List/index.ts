import PType, { PDataRepresentable } from "../../PType";
import PBool, { pBool } from "../../PTypes/PBool";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt, { pInt } from "../../PTypes/PInt";
import PList, { pnil } from "../../PTypes/PList";
import { papp, perror, pfn, phoist, plam, plet, precursive } from "../../Syntax";
import Term from "../../Term";
import Type, { ConstantableTermType, TermType, ToPType } from "../../Term/Type";
import { pchooseList, phead, pif, pisEmpty, pstrictIf, ptail } from "../Builtins";
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
    return phoist(
        precursive(
            pfn([
                    Type.Lambda( Type.List( elemsT ) , returnT ),
                    Type.Lambda( Type.Lambda( Type.List( elemsT ), returnT ), returnT ),
                    Type.Fn([ Type.Lambda( Type.List( elemsT ), returnT ), elemsT, Type.List( elemsT ) ], returnT ),
                    Type.List( elemsT )
                ], 
                returnT 
            )
            ( ( self, matchNil, matchCons, list ) => pchooseList( elemsT, returnT ).$( list )
                .caseNil(
                    papp(
                        matchNil,
                        self
                    ) as any
                )
                .caseCons(
                    papp(
                        papp(
                            papp(
                                matchCons,
                                self
                            ),
                            phead( elemsT ).$( list )
                        ),
                        ptail( elemsT ).$( list )
                    ) as Term<ToPType<ReturnT>>
                )
            ) as any
        ) as any
    );
}

export function pindexList<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
    : TermFn<[ PInt, PList<ToPType<ElemsT>> ], ToPType<ElemsT>>
{
    return phoist(
        precursive<PInt, PLam<PList<ToPType<ElemsT>>,ToPType<ElemsT>>>(

            pfn(
                [
                    Type.Fn([ Type.Int, Type.List( elemsT ) ], elemsT),
                    Type.Int,
                    Type.List( elemsT )
                ],
                elemsT
            )(
                ( self, idx, list ) => 

                    pif( elemsT ).$( pisEmpty.$( list ) )
                    .then( perror( elemsT ) )
                    .else(

                        pif( elemsT ).$( pInt( 0 ).eq( idx ) )
                        .then( phead( elemsT ).$( list ) as any )
                        .else(
                            papp(
                                papp(
                                    self,
                                    pInt( -1 ).add( idx )
                                ),
                                ptail( elemsT ).$( list )
                            ) as Term<ToPType<ElemsT>>
                        )

                    )
            )

        )
    )
}


export function pfindList<ElemsT extends ConstantableTermType, PElemsT extends ToPType<ElemsT>>( elemsT: ElemsT )
    : TermFn<[ PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{
    return phoist(
        precursive< PLam<PElemsT,PBool>, PLam<PList<PElemsT>,PMaybeT<PElemsT>>>(
            pfn(
                [
                    Type.Fn([ Type.Lambda( elemsT, Type.Bool ), Type.List( elemsT ) ], Type.Data.Constr ),
                    Type.Lambda( elemsT, Type.Bool ),
                    Type.List( elemsT )
                ],
                /**
                 * @fixme add Type.Struct({ <Definiton> }) Type
                 */
                Type.Data.Constr
            )(
                ( self, predicate, list ) =>
                    /**
                     * @fixme add Type.Struct({ <Definiton> }) Type
                     */
                    pstrictIf( Type.Data.Constr ).$( pisEmpty.$( list ) )
                    .$( PMaybe( PDataRepresentable ).Nothing({}) as any )
                    .$(
                        plet<PElemsT, Term<PElemsT>>( phead( elemsT ).$( list ) as any ).in(
                            head => 
                                /**
                                 * @fixme add Type.Struct({ <Definiton> }) Type
                                 */
                                pif( Type.Data.Constr ).$(
                                    papp(
                                        predicate,
                                        head
                                    ) as Term<PBool>
                                )
                                .then( PMaybe<PElemsT>( PDataRepresentable as any ).Just({ value: head as any }) as any )
                                .else(
                                    papp(
                                        papp(
                                            self,
                                            predicate
                                        ),
                                        ptail( elemsT ).$( list )
                                    ) as any
                                )
                        )
                    ) as any
            ) as any
        )
    )
}
