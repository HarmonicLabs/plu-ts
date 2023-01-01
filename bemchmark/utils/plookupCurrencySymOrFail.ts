import { bs, int, list, pair, perror, pfn, phoist } from "../../src";
import PCurrencySymbol from "../../src/onchain/pluts/API/V1/Value/PCurrencySymbol";
import PTokenName from "../../src/onchain/pluts/API/V1/Value/PTokenName";
import PValue from "../../src/onchain/pluts/API/V1/Value/PValue";
import pmatch from "../../src/onchain/pluts/PTypes/PStruct/pmatch";
import punsafeConvertType from "../../src/onchain/pluts/Syntax/punsafeConvertType";

const plookupCurrencySymOrFail = phoist(
    pfn([
        PValue.type,
        PCurrencySymbol.type
    ],  list( pair( PTokenName.type, int ) ) )
    (( value, cs ) =>

    pmatch(
        value.find( entry => entry.fst.eq( cs ) )
    )
    .onJust( _ => _.extract("val").in( just =>
        punsafeConvertType(
            just.val,
            pair(
                bs,
                list( pair(
                    PTokenName.type,
                    int
                ) )
            ) 
        ).snd ) )
    .onNothing( _ => perror( list( pair( PTokenName.type, int ) ) ) )
));

export default plookupCurrencySymOrFail;