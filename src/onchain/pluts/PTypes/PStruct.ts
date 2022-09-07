import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import { pfstPair, punConstrData } from "../Prelude/Builtins";
import PType from "../PType";
import { plet } from "../Syntax";
import Term from "../Term";
import Type, { Type as Ty } from "../Term/Type";
import PData from "./PData";

export class PStruct extends PType
{
    constructor()
    {
        super();
    }
}

export interface PStructConstructorDescriptor {
    name: string,
    fields?: {
        [field: string]: new () => PType
    }
}

export function isStructCtorDescriptor( descriptor: object ): descriptor is PStructConstructorDescriptor
{
    if( !(typeof descriptor === "object") ) return false;
                
    return true;
} 

export type PStructExtension = {
    new(): PStruct
}

export default function pstruct( ctorsDescriptions: PStructConstructorDescriptor[] ): PStructExtension
{
    JsRuntime.assert(
        Array.isArray( ctorsDescriptions ) &&
        ctorsDescriptions.every( isStructCtorDescriptor ),
        "cannot construct 'PStruct' type; invalid constructors"
    );

    class PStructExt extends PStruct
    {

        static termType: Ty;
        static fromData: ( data: Term<PData> ) => Term<PStructExt>;
        static const: ( jsStruct: PStructExt ) => Term<PStructExt>;
    }

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "termType",
        Type.Data.Any // @fixme
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "fromData",
        ( data: Term<PData> ): Term<PStructExt> => {
            return plet(
                punConstrData.$( data )
            ).in( constrPair => pfstPair( Type.Int , Type.List( Type.Data.Any ) ).$( constrPair ) )
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "const",
        ( jsStruct: PStructExt ): Term<PStructExt> => {
            
        }
    );

    return PStructExt;
}

export function pgenericStruct
    ( getCtorsDescriptors: ( ...tyArgs: (new () => PType)[] ) => PStructConstructorDescriptor[] )
    : ( ...tyArgs: (new () => PType)[] ) => PStructExtension
{
    return ( ...tyArgs: (new () => PType)[] ) =>
        pstruct( getCtorsDescriptors( ...tyArgs ) );
}

const PMaybe = pgenericStruct(([ tyArg ]) => [
    {
        name: "Just",
        fields: {
            value: StructInstance
        }
    },
    {
        name: "Nothing"
    }
])