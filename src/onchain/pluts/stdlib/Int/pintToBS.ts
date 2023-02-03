import { ByteString } from "../../../..";
import { pByteString } from "../../PTypes";
import { phoist, plam } from "../../Syntax";
import { int, bs } from "../../Term/Type";

export const pintToBS = phoist(
    plam( int, bs )
    (( n ) => pByteString(ByteString.fromAscii("")).prepend( n.add( 48 ) ) )
);

