import { int, list, pair } from "../../../Term/Type";
import PCurrencySymbol from "./PCurrencySymbol";
import PTokenName from "./PTokenName";

// const PValue = palias( ... );
const PValue = list(
    pair(
        PCurrencySymbol,
        list(
            pair(
                PTokenName,
                int
            )
        )
    )
);

export default PValue;