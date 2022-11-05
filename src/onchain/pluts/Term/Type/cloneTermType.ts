import { TermType, AnyAlias, PrimType, DataConstructor } from "./base";
import JsRuntime from "../../../../utils/JsRuntime";
import { cloneStructDef } from "../../PTypes/PStruct/pstruct";
import { isAliasType, isStructType } from "./kinds";


export default function cloneTermType( t: TermType ): TermType
{
    // covers
    // - simple types
    // - simple data types
    // - parameters
    if( t.length === 1 ) return [ ...t ];

    if( isAliasType( t ) )
    {
        return Object.freeze([ t[0], { id: t[1].id, type: cloneTermType( t[1].type ) } ]) as AnyAlias;
    }
    if( isStructType( t ) )
    {
        return [ t[0], typeof t[1] === "symbol" ? t[1] : cloneStructDef( t[1] ) ]
    }

    if( t[0] === PrimType.List ) return [ PrimType.List, cloneTermType( t[1] ) ];
    if( t[0] === PrimType.Delayed ) return [ PrimType.Delayed, cloneTermType( t[1] ) ];
    if( t[0] === PrimType.Pair ) return [ PrimType.Pair, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    if( t[0] === PrimType.Lambda ) return [ PrimType.Lambda, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    if( t[0] === DataConstructor.List ) return [ DataConstructor.List, cloneTermType( t[1] ) ];
    if( t[0] === DataConstructor.Pair ) return [ DataConstructor.Pair, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "'cloneTermType' did not match any 'TermType'"
    );
}