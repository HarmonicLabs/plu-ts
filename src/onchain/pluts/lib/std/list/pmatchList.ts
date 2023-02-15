import { PType } from "../../../PType";
import { TermFn, PLam, PList } from "../../../PTypes";
import { TermType, tyVar, ToPType, fn, list, delayed } from "../../../type_system";
import { pchooseList, phead, pstrictChooseList, ptail } from "../../builtins";
import { papp } from "../../papp";
import { pdelay } from "../../pdelay";
import { pfn } from "../../pfn";
import { pforce } from "../../pforce";
import { phoist } from "../../phoist";


export function pmatchList<ReturnT  extends TermType, PElemsT extends PType>( returnT: ReturnT, elemsT: TermType )
: TermFn<[ PElemsT, PLam<PElemsT,PLam<PList<PElemsT>, ToPType<ReturnT>>>, PList<PElemsT> ], ToPType<ReturnT>>
{
return phoist(
    pfn([
            delayed( returnT ),
            fn([ elemsT, list( elemsT ) ], returnT ),
            list( elemsT )
        ], 
        returnT 
    )
    ( ( matchNil, matchCons, list ) =>
        pforce(
            pstrictChooseList( elemsT, delayed( returnT ) ).$( list )
            .$( matchNil ) // caseNil
            .$(
                pdelay(
                    papp(
                        papp(
                            matchCons,
                            phead( elemsT ).$( list )
                        ),
                        ptail( elemsT ).$( list )
                    )
                ) as any
            )
        )
    ) as any
);
}