import { ByteString } from "@harmoniclabs/bytestring";
import { bs, int } from "../../../type_system/types";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pByteString } from "../bs/pByteString";

export const pdigitToBS = phoist(
    plam( int, bs )
    (( n ) => pByteString(ByteString.fromAscii("")).prepend( n.add( 48 ) ) )
);

