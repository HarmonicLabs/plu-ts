import BasePlutsError from "../../../../errors/BasePlutsError";
import ByteString from "../../../../types/HexString/ByteString";
import Integer from "../../../../types/ints/Integer";
import Data, { isData } from "../Data";
import UPLCUnit from "./UPCUnit";
import { UPLCBool } from "./UPLCBool";

type UPLCPrimitive
    = UPLCUnit
    | UPLCBool
    | Integer
    | ByteString
    | Data

export default UPLCPrimitive;

export type TypeOfUPLCPrimitive
    = "unit"
    | "bool"
    | "integer"
    | "bytestring"
    | "data";

export function typeOfUPLCPrimitive( prim: UPLCPrimitive ): TypeOfUPLCPrimitive
{
    if( prim instanceof UPLCUnit )          return "unit";
    else if( prim instanceof UPLCBool )     return "bool";
    else if( prim instanceof Integer )      return "integer";
    else if( prim instanceof ByteString )   return "bytestring";
    else if( isData( prim ) )               return "data";
    else throw new BasePlutsError("non primitive value passed to 'typeOfUPLCPrimitive'")
}