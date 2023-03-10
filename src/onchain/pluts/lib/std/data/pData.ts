import { Data } from "../../../../../types/Data/Data";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../Term";
import { PAsData, PByteString, PData, PInt } from "../../../PTypes";
import { asData, bs, data, int } from "../../../type_system/types";
import { ByteString } from "../../../../../types/HexString/ByteString";
import { DataI } from "../../../../../types/Data/DataI";
import { DataB } from "../../../../../types/Data/DataB";

export function pData( dataElem: Data )
: Term<PData>
{
    return new Term(
        data,
        _dbn => UPLCConst.data( dataElem ),
        true // isConstant
    );
}

export function pDataI( n: number | bigint ): Term<PAsData<PInt>>
{
    return new Term(
        asData( int ),
        _dbn => UPLCConst.data( new DataI( n ) ),
        true // isConstant
    );
}


export function pDataB( b: string | ByteString | Uint8Array ): Term<PAsData<PByteString>>
{
    return new Term(
        asData( bs ),
        _dbn => UPLCConst.data( new DataB( b ) ),
        true // isConstant
    );
}