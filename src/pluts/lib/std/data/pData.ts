import { Term } from "../../../Term";
import { PAsData, PByteString, PData, PInt } from "../../../PTypes";
import { asData, bs, data, int } from "../../../../type_system/types";
import { Data, DataB, DataI } from "@harmoniclabs/plutus-data";
import { ByteString } from "@harmoniclabs/bytestring";
import { IRConst } from "../../../../IR/IRNodes/IRConst";

export function pData( dataElem: Data )
: Term<PData>
{
    return new Term(
        data,
        _dbn => IRConst.data( dataElem ),
        true // isConstant
    );
}

export function pDataI( n: number | bigint ): Term<PAsData<PInt>>
{
    return new Term(
        asData( int ),
        _dbn => IRConst.data( new DataI( n ) ),
        true // isConstant
    );
}


export function pDataB( b: string | ByteString | Uint8Array ): Term<PAsData<PByteString>>
{
    return new Term(
        asData( bs ),
        _dbn => IRConst.data( new DataB( b ) ),
        true // isConstant
    );
}