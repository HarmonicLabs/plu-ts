import PlutusCoreName from "../../plutus-core-spec/PlutusCoreName";
import PlutusCoreBoolean from "./PlutusCoreBoolean";
import PlutusCoreByteString from "../../plutus-core-spec/PlutusCoreByeString";
import PlutusCoreInteger from "./PlutusCoreInteger";
import PlutusCoreUnit from "./PlutusCoreUnit";


type Value = PlutusCoreUnit | PlutusCoreBoolean | PlutusCoreByteString | PlutusCoreInteger | PlutusCoreName

export class PlutusCoreValue {
    private _const: Value;
    constructor( constant: Value )
    {
        this._const = constant;
    }
}


export type Constant = Value;


export type Var = PlutusCoreName;
export type TyVar = PlutusCoreName;
export type BuiltinName = PlutusCoreName;
export type TypeConstant = PlutusCoreName;


export default {
    PlutusCoreName,
    PlutusCoreBoolean,
    PlutusCoreByteString,
    PlutusCoreInteger,
    PlutusCoreUnit,
    PlutusCoreValue
}
