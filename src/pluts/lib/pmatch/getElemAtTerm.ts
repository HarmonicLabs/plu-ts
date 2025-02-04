import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { phead } from "../builtins/list";
import { TermFn } from "../../PTypes/PFn/PFn";
import { PList } from "../../PTypes/PList";
import { PData } from "../../PTypes/PData/PData";
import { data, lam, list } from "../../../type_system/types";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRTerm } from "../../../IR/IRTerm";
import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { Term } from "../../Term";

const elemAtCache: { [n: number]: TermFn<[ PList<PData> ], PData > } = {};

export function getElemAtTerm( n: number ): TermFn<[ PList<PData> ], PData >
{
    if( n < 0 || n !== Math.round(n) )
    throw new Error(
        "unexpected index in pmatch field extraction"
    );

    if( elemAtCache[n] !== undefined ) return elemAtCache[n];

    if( n === 0 ) return phead( data );

    const funcName = "elem_at_" + n.toString();

    let uplc: IRTerm = new IRVar(0);

    const initialN = n;
    while( n > 0 )
    {
        uplc = new IRApp( IRNative.tailList, uplc );
        n--;
    }

    // every use of this MUST be cloned
    // headList and tailList are forced natives and WILL be hoisted out
    uplc = new IRHoisted(
        new IRFunc(
            1,
            new IRApp(
                IRNative.headList,
                uplc
            ),
            funcName
        )
    );

    const term = new Term( lam( list(data), data ), _dbn => uplc.clone() );

    uplc.hash;
    defineReadOnlyProperty(
        term, "$",
        ( lst: Term<PList<PData>>) => 
            new Term(
                data,
                (cfg, dbn) => new IRApp( uplc.clone(), lst.toIR( cfg, dbn) )
            )
    );

    elemAtCache[initialN] = term as any;
    return term as any;
}