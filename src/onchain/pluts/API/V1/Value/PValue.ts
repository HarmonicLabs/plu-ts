import palias from "../../../PTypes/PAlias/palias";
import { int, list, pair } from "../../../Term/Type/base";
import PCurrencySymbol from "./PCurrencySymbol";
import PTokenName from "./PTokenName";

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
