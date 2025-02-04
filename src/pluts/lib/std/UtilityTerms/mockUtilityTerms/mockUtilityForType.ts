import { PType } from "../../../../PType";
import type { PAlias } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { isTaggedAsAlias } from "../../../../../type_system/kinds/isTaggedAsAlias";
import { isStructType } from "../../../../../type_system/kinds/isWellFormedType";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../../type_system/typeExtends";
import { Methods, PrimType, TermType, bool, bs, int, lam, list, pair, str, tyVar } from "../../../../../type_system/types";
import { unwrapAlias } from "../../../../../type_system/tyArgs/unwrapAlias";
import {
    TermAlias,
} from "../../UtilityTerms";
import { defineNonDeletableNormalProperty } from "@harmoniclabs/obj-utils";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";
import { termTypeToString } from "../../../../../type_system/utils";
import { UtilityTermOf } from "../../UtilityTerms/addUtilityForType";
import { mockUserMethods } from "./mockUserMethods";
import { mockPBoolMethods } from "./mockPBoolMethods";
import { mockPapp } from "./mockPapp";
import { mockPByteStringMethods } from "./mockPByteStringMethods";
import { mockPIntMethods } from "./mockPIntMethods";
import { mockPListMethods } from "./mockPListMethods";
import { mockPPairMethods } from "./mockPPairMethods";
import { mockPStringMethods } from "./mockPStringMethods";
import { mockPStructMethods } from "./mockPStructMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";

/**
 * like `addUtilityForType` but it doesn't add real terms;
 * 
 * the generated terms are not intended to end in the compilation result
 * rather are useful to add the expected properties to the terms and their types
 * 
 * `mockUtilityForType` is requires less work and less dependecies than `addUtilityForType`
 */
export function mockUtilityForType<T extends TermType>( t: T )
    : ( term: Term<ToPType<T>> ) => UtilityTermOf<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ){
        return mockPAliasMethods as any
    };

    if( typeExtends( t , bool ) ) return mockPBoolMethods as any;
    if( typeExtends( t , bs   ) ) return mockPByteStringMethods as any;
    if( typeExtends( t , int  ) ) return mockPIntMethods as any;
    if( typeExtends( t , list( tyVar() ) ) ) return mockPListMethods as any;
    if( typeExtends( t , pair( tyVar(), tyVar() ) ) ) return mockPPairMethods as any;
    if( typeExtends( t , str  ) ) return mockPStringMethods as any;

    if( typeExtends( t, lam( tyVar(), tyVar() )) )
    {
        return (( term: any ) =>
            {
                term = addBaseUtilityTerm( term );

                return defineNonDeletableNormalProperty(
                    term,
                    "$",
                    ( input: any ) =>
                        mockPapp( term, input )
                );
            }
        ) as any;
    }

    if( isStructType( t ) )
    {
        return mockPStructMethods as any;
    }

    // no utility
    return ((x: any) => addBaseUtilityTerm( x )) as any;
}

// `mockPAliasMethod` is (necessarily) mutually recursive with `mockUtilityForType`
// so it is defined in this file instead of "./UtilityTerms/TermAlias.ts"
export function mockPAliasMethods<
    PAliased extends PType,
    AMethods extends Methods
>(
    aliasTerm: Term<PAlias<PAliased,AMethods>>
): TermAlias<PAliased, AMethods>
{
    aliasTerm = addBaseUtilityTerm( aliasTerm );

    const originalType = aliasTerm.type;

    if( originalType[0] !== PrimType.Alias )
    {
        console.error( originalType );
        try {
            console.error( termTypeToString( originalType ) )
        }
        catch {}

        throw new Error("mockPAliasMethods used on non-alias type");
    }

    const aliasedType = unwrapAlias( originalType );
    
    aliasTerm = mockUtilityForType( aliasedType )( aliasTerm ) as any;

    aliasTerm = _punsafeConvertType( aliasTerm, originalType ) as any;

    aliasTerm = mockUserMethods( aliasTerm, aliasTerm.type[2] as AMethods );

    return aliasTerm as any;
}