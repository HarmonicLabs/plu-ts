import { TirBoolT, TirBytesT, TirDataT, TirFuncT, TirLinearMapT, TirListT, TirIntT, TirOptT, TirSopT, TirVoidT } from "../../../../tir/TirNativeType";
import { Scope } from "../Scope";
import { PebbleTypeSym } from "../symbols/PebbleSym";
import { TirNativeType } from "../../../../tir/TirNativeType";


/**
 * defines the {@link TirNativeType}s as 
 * {@link PebbleTypeSym}s in the standard scope
 */
export const stdScope = new Scope( undefined );

stdScope.defineType(
    new PebbleTypeSym({
        name: "void",
        isBuiltinType: true,
        nTypeParameters: 0,
        getConcreteType: () => new TirVoidT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "boolean",
        isBuiltinType: true,
        nTypeParameters: 0,
        getConcreteType: () => new TirBoolT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "int",
        isBuiltinType: true,
        nTypeParameters: 0,
        getConcreteType: () => new TirIntT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "bytes",
        isBuiltinType: true,
        nTypeParameters: 0,
        getConcreteType: () => new TirBytesT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "data",
        isBuiltinType: true,
        nTypeParameters: 0,
        getConcreteType: () => new TirDataT()
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "Optional",
        isBuiltinType: true,
        nTypeParameters: 1,
        getConcreteType: ( tyArg ) => new TirOptT( tyArg )
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "List",
        isBuiltinType: true,
        nTypeParameters: 1,
        getConcreteType: ( tyArg ) => new TirListT( tyArg )
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "LinearMap",
        isBuiltinType: true,
        nTypeParameters: 2,
        getConcreteType: ( keyTyArg, valTyArg ) => new TirLinearMapT( keyTyArg, valTyArg )
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "=>",
        isBuiltinType: true,
        nTypeParameters: -1,
        getConcreteType: ( params, ret ) => new TirFuncT( params, ret )
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "Sop",
        isBuiltinType: true,
        nTypeParameters: -2,
        getConcreteType: ( arg ) => new TirSopT( arg )
    })
);
stdScope.defineType(
    new PebbleTypeSym({
        name: "AsData",
        isBuiltinType: true,
        nTypeParameters: -2,
        getConcreteType: ( arg ) => new TirSopT( arg )
    })
);