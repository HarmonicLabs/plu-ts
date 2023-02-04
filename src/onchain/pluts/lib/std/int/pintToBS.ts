import { ByteString } from "../../../../../types/HexString/ByteString";
import { int, bs } from "../../../Term/Type";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pByteString } from "../bs/pByteString";

export const pintToBS = phoist(
    plam( int, bs )
    (( n ) => pByteString(ByteString.fromAscii("")).prepend( n.add( 48 ) ) )
);

