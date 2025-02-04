import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { PData } from "../../PTypes/PData/PData";
import { PLam } from "../../PTypes/PFn/PLam";
import { PList } from "../../PTypes/PList";
import { Term } from "../../Term";
import { punConstrData } from "../../lib/builtins/data";
import { psndPairNoUnwrap } from "../../lib/builtins/pair/noUnwrap";
import { papp } from "../../lib/papp";
import { pfn } from "../../lib/pfn";
import { phoist } from "../../lib/phoist";
import { data, lam, list, int, TermType } from "../../../type_system";

const hoisted_getFields = new IRHoisted(
    new IRFunc( 1, // struct
        new IRApp(
            IRNative.sndPair,
            new IRApp(
                IRNative.unConstrData,
                new IRVar( 0 )
            )
        )
    )
);
hoisted_getFields.hash;

export const getFields = new Term<PLam<PData, PList<PData>>>(
    lam( data, list( data ) ),
    _dbn => hoisted_getFields.clone()
);

export const matchSingleCtorStruct = (( returnT: TermType ) =>  phoist(
    pfn([
        data,
        lam( list(data), returnT )
    ],  returnT)
    ((structData, continuation) => 
        // it makes no sense to extract the ctor index for datatype defined as single ctors
        // even from security point of view
        // an attacker can always change the data to match the ctor index expected 
        papp( continuation, psndPairNoUnwrap( int, list(data) ).$( punConstrData.$( structData ) ) )
    )
));