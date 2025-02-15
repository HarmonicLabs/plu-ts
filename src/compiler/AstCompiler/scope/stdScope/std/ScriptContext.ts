import { TirStructConstr, TirStructField, TirStructType } from "../../../../../tir/TirStructType";
import { PebbleTypeSym } from "../../symbols/PebbleSym";


export const nativeScriptContextType = new TirStructType(
    "ScriptContext",
    [
        new TirStructConstr(
            "ScriptContext",
            [
                new TirStructField("tx", ),
                new TirStructField("redeemer", ),
                new TirStructField("purpose", ),
            ]
        )
    ],
    [] // impls
);
export const nativeScriptContextSymbol = new PebbleTypeSym({
    name: "ScriptContext",
    nTypeParameters: 0,
    getConcreteType: () => nativeScriptContextType
});