import { PType } from "../../../PType";
import { TermFn, PLam, PList } from "../../../PTypes";
import { TermType, tyVar, Type } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pchooseList, phead, ptail } from "../../builtins";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";


export function pmatchList<ReturnT  extends TermType, PElemsT extends PType>( returnT: ReturnT, elemsT: TermType = tyVar("elemsT_pmatchList") )
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