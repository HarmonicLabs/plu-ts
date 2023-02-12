import { palias } from "../../../../PTypes/PAlias/palias";
import { int, list, dynPair } from "../../../../Term/Type/base";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";

export const PAssetsEntryT = dynPair(
        PTokenName.type,
        int
    );

export const PValueEntryT = dynPair(
        PCurrencySymbol.type,
        list( PAssetsEntryT )
    );

export const PValue = palias(
    list( PValueEntryT )
);