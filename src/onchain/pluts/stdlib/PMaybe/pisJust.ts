import PType from "../../PType";
import { pBool, TermFn } from "../../PTypes";
import PBool from "../../PTypes/PBool";
import pmatch from "../../PTypes/PStruct/pmatch";
import { phoist, plam } from "../../Syntax/syntax";
import Term from "../../Term";
import { bool, tyVar } from "../../Term/Type/base";
import PMaybe, { PMaybeT } from "./PMaybe";

const pisJust: TermFn<[PMaybeT<PType>], PBool> = phoist(
    plam( PMaybe.type, bool )
    ( maybe =>
        pmatch( maybe as any as Term<PMaybeT<PType>> )
        .onJust   ( _ => pBool( true  ) )
        .onNothing( _ => pBool( false ) )
    )
) as any;

export default pisJust;