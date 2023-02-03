import { palias } from "../../../../PTypes/PAlias/palias";
import { int, list, pair } from "../../../../Term/Type/base";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";

export const PAssetsEntry = palias(
    pair(
        PTokenName.type,
        int
    )
);

export const PValueEntry = palias(
    pair(
        PCurrencySymbol.type,
        list( PAssetsEntry.type )
    )
);

export const PValue = palias(
    list( PValueEntry.type )
);