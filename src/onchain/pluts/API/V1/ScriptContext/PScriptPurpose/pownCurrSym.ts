import PScriptPurpose from ".";
import { PCurrencySymbol } from "../../..";
import pmatch from "../../../../PTypes/PStruct/pmatch";
import { perror, phoist, plam } from "../../../../Syntax";

const pownCurrSym = phoist(
    plam( PScriptPurpose.type, PCurrencySymbol.type )
    ( purpose => pmatch( purpose )
        .onMinting( raw => raw.extract("currencySym").in(({ currencySym }) => currencySym ))
        // @ts-ignore
        ._( _ => perror( PCurrencySymbol.type ) )
    )
);

export default pownCurrSym;