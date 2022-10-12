import palias from "../../../PTypes/PAlias";
import { int, list, pair } from "../../../Term/Type";
import PCurrencySymbol from "./PCurrencySymbol";
import PTokenName from "./PTokenName";

// const PValue = palias( ... );
const PValue = palias(
    list(
        pair(
            PCurrencySymbol.type,
            list(
                pair(
                    PTokenName.type,
                    int
                )
            )
        )
    )
);

export default PValue;