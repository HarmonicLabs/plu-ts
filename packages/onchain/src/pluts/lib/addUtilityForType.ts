import { PType } from "../PType";
import type { PBool, PByteString, PInt, PList, PPair, PString, PStruct, PLam, PAlias } from "../PTypes";
import { Term } from "../Term";
import { isTaggedAsAlias } from "../type_system/kinds/isTaggedAsAlias";
import { isStructType } from "../type_system/kinds/isWellFormedType";
import { ToPType } from "../type_system/ts-pluts-conversion";
import { typeExtends } from "../type_system/typeExtends";
import { Methods, StructDefinition, TermType, bool, bs, int, lam, list, pair, str, tyVar } from "../type_system/types";
import { unwrapAlias } from "../type_system/tyArgs/unwrapAlias";
import type { PappArg } from "./pappArg";
import { papp } from "./papp";
import {
    TermAlias,
    TermBool,       addPBoolMethods,
    TermBS,         addPByteStringMethods,
    TermInt,        addPIntMethods,
    TermList,       addPListMethods,
    TermPair,       addPPairMethods,
    TermStr,        addPStringMethods,
    TermStruct,     addPStructMethods
} from "./std/UtilityTerms";
import { defineNonDeletableNormalProperty } from "@harmoniclabs/obj-utils";
import { addUserMethods } from "./std/UtilityTerms/userMethods/addUserMethods";


// given the index returns the previous number ( PrevNum[2] -> 1; etc... )
type PrevNum = [ never, 0, 1, 2, 3, 4, 5, 6 ];

// without the "finite" version typescript gets angry and says the type is too complex to be evaluated
type FiniteTermAlias<PT extends PType, AMethods extends Methods, MaxDepth extends PrevNum[number] = 6> =
    MaxDepth extends never ? never :
    PT extends PAlias<infer ActualPT extends PType, infer ActualAMethods extends Methods > ?
        FiniteTermAlias<ActualPT, ActualAMethods & AMethods, PrevNum[MaxDepth]> :
        TermAlias<PT, AMethods>

export type UtilityTermOf<PElem extends PType> = 
    (
        PElem extends PBool ? TermBool :
        PElem extends PByteString ? TermBS : 
        PElem extends PInt ? TermInt :
        PElem extends PList<infer PListElem extends PType> ? TermList<PListElem> :
        PElem extends PPair<infer PFst extends PType,infer PSnd extends PType> ? TermPair<PFst,PSnd> :
        PElem extends PString ? TermStr :
        PElem extends PStruct<infer SDef extends StructDefinition, infer SMethods extends Methods> ? TermStruct<SDef, SMethods> :
        PElem extends PLam<infer PInput extends PType, infer POutput extends PType> ?
            Term<PElem> & {
                $: ( input: PappArg<PInput> ) => UtilityTermOf<POutput>
            } :
        PElem extends PAlias<infer PT extends PType, infer AMethods extends Methods> ? FiniteTermAlias<PT, AMethods> :
        Term<PElem>
    ) & Term<PElem> // needed because sometime typescript doesn't understands that the term is the same just extended

export function addUtilityForType<T extends TermType>( t: T )
    : ( term: Term<ToPType<T>> ) => UtilityTermOf<ToPType<T>>
{
    // console.log("adding utility to ", termTypeToString( t ) );
    if( isTaggedAsAlias( t ) ) return addPAliasMethods as any;

    if( typeExtends( t , bool ) ) return addPBoolMethods as any;
    if( typeExtends( t , bs   ) ) return addPByteStringMethods as any;
    if( typeExtends( t , int  ) ) return addPIntMethods as any;
    if( typeExtends( t , list( tyVar() ) ) ) return addPListMethods as any;
    if( typeExtends( t , pair( tyVar(), tyVar() ) ) ) return addPPairMethods as any;
    if( typeExtends( t , str  ) ) return addPStringMethods as any;

    if( typeExtends( t, lam( tyVar(), tyVar() )) )
    {
        return (( term: any ) => defineNonDeletableNormalProperty(
            term,
            "$",
            ( input: any ) =>
                papp( term, input )
        )) as any;
    }

    if( isStructType( t ) )
    {
        return addPStructMethods as any;
    }

    // no utility
    return ((x: any) => x) as any;
}

// `addPAliasMethod` is (necessarily) mutually recursive with `addUtilityForType`
// so it is defined in this file instead of "./UtilityTerms/TermAlias.ts"
export function addPAliasMethods<
    PAliased extends PType,
    AMethods extends Methods
>(
    aliasTerm: Term<PAlias<PAliased,AMethods>>
): TermAlias<PAliased, AMethods>
{
    const actualType = unwrapAlias( aliasTerm.type );
    const addActualTypeUtility = addUtilityForType( actualType );

    aliasTerm = addActualTypeUtility( aliasTerm ) as any;
    aliasTerm = addUserMethods( aliasTerm, aliasTerm.type[2] as AMethods );

    return aliasTerm as any;
}