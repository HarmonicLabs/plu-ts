import PValue from ".";
import { PList } from "../../../..";
import { ReturnT } from "../../../../../../utils/ts";
import { TermFn } from "../../../../PTypes/PFn/PLam";
import { pfstPair } from "../../../../stdlib";
import TermAlias from "../../../../stdlib/UtilityTerms/TermAlias";
import { plam } from "../../../../Syntax/syntax";
import { int, list, pair } from "../../../../Term/Type";
import PCurrencySymbol from "../PCurrencySymbol";
import PTokenName from "../PTokenName";

const pcurrSymsOf: TermFn<[ typeof PValue ], PList<typeof PCurrencySymbol>> =
    plam( PValue.type, list( PCurrencySymbol.type ) )
    (( value => {

        const valueEntry = pair(
            PCurrencySymbol.type,
            list(
                pair(
                    PTokenName.type,
                    int
                )
            )
        );

        return value.map(
            plam(
                valueEntry,
                PCurrencySymbol.type
            )
            ( entry =>
                pfstPair( valueEntry[1], valueEntry[2] ).$( entry ) 
            )
        );
    }));