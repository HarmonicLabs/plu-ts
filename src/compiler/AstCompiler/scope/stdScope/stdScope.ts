import { TirBoolT, TirNumT, TirVoidT } from "../../../../tir/TirNativeType";
import { Scope } from "../Scope";
import { PebbleTypeSym } from "../symbols/PebbleSym";


export const stdScope = new Scope( undefined );

stdScope.defineType(
    new PebbleTypeSym({
        name: "void",
        isBuiltinType: true,
        typeDef: new TirVoidT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "boolean",
        isBuiltinType: true,
        typeDef: new TirBoolT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "number",
        isBuiltinType: true,
        typeDef: new TirNumT()
    })
);