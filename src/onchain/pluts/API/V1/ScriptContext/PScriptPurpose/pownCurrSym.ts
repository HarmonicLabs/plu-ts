import { PScriptPurpose } from ".";
import { pmatch } from "../../../../PTypes/PStruct/pmatch";
import { perror, phoist, plam } from "../../../../Syntax";
import { PCurrencySymbol } from "../../Value/PCurrencySymbol";

export const pownCurrSym = phoist(
    plam( PScriptPurpose.type, PCurrencySymbol.type )
    ( purpose => pmatch( purpose )
        .onMinting( raw => raw.extract("currencySym").in(({ currencySym }) => currencySym ))
        ._( _ => perror( PCurrencySymbol.type ) as any  )
    )
);