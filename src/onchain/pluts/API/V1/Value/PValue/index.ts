import { palias } from "../../../../PTypes/PAlias/palias";
import { asData, int, list, pair } from "../../../../type_system/types";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";

export const PAssetsEntryT = pair(
    PTokenName.type,
    int
);

export const PValueEntryT = pair(
    PCurrencySymbol.type,
    list( PAssetsEntryT )
);

export const PValue = palias(
    list( PValueEntryT )
);