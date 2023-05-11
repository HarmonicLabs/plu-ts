import ObjectUtils from "../../../../../src/utils/ObjectUtils";
import { getFstT, getSndT, unwrapAlias } from "./tyArgs";
import { PrimType, TermType, alias, asData, lam, list, pair } from "./types";

export function withAllPairElemsAsData<T extends TermType>( t: T ): TermType
{
    if( t[0] === PrimType.Alias ) return alias( withAllPairElemsAsData( unwrapAlias( t as any ) ) );
    if( t[0] === PrimType.AsData ) return t;
    if( t[0] === PrimType.Struct )
    {
        const adjustedStructDef = {};
        const sDef = t[1];
        const ctors = Object.keys( sDef );
        for( let i = 0; i < ctors.length; i++ )
        {
            const thisCtor = ctors[i];
            const ctorDef = sDef[ thisCtor ];
            const fields = Object.keys( ctorDef );
            const adjustedCtorDef = {};
            for( let j = 0; j < fields.length; j++ )
            {
                const thisField = fields[j];
                ObjectUtils.defineReadOnlyProperty(
                    adjustedCtorDef, thisField, withAllPairElemsAsData( ctorDef[thisField] ) 
                );
            }
            ObjectUtils.defineReadOnlyProperty(
                adjustedStructDef, thisCtor, adjustedCtorDef
            )
        }
    }
    
    if( t[0] === PrimType.Pair )
    return pair( 
        asData( getFstT( t ) ), 
        asData( getSndT( t ) )
    );

    if( t[0] === PrimType.List ) return list( withAllPairElemsAsData( t[1] ) );
    if( t[0] === PrimType.Lambda ) return lam( withAllPairElemsAsData(t[1]), withAllPairElemsAsData(t[2]) );

    return t;
}