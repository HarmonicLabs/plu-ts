import { PType } from "../../../PType";
import type { PBool, PByteString, PInt, PList, PPair, PString, PStruct, PLam, PAlias } from "../../../PTypes";
import { Term } from "../../../Term";
import { papp } from "../../papp";
import type { TermAlias } from "./TermAlias";
import { type TermBool,       addPBoolMethods } from "./TermBool";
import { type TermBS,         addPByteStringMethods } from "./TermBS";
import { type TermInt,        addPIntMethods } from "./TermInt";
import { type TermList,       addPListMethods } from "./TermList";
import { type TermPair,       addPPairMethods } from "./TermPair";
import { type TermStr,        addPStringMethods } from "./TermStr";
import { type TermStruct,     addPStructMethods } from "./TermStruct";
import { defineNonDeletableNormalProperty } from "@harmoniclabs/obj-utils";
import { addUserMethods } from "./userMethods/addUserMethods";
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm";
import { Methods, StructDefinition, TermType, ToPType, isTaggedAsAlias, typeExtends, bool, bs, int, list, tyVar, pair, str, lam, isStructType, PrimType, termTypeToString, unwrapAlias } from "../../../../type_system";
import { PappArg } from "../../pappArg";

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
        // PElem extends PLam<PType,PType> ?
        //     Term<PElem> & {
        //         $: ( input: Term<PType> ) => Term<PType>
        //     } :
        PElem extends PAlias<infer PT extends PType, infer AMethods extends Methods> ? FiniteTermAlias<PT, AMethods> :
        Term<PElem>
    ) & Term<PElem> // needed because sometime typescript doesn't understands that the term is the same just extended
    & ( PElem extends PLam<PType,PType> ? {} : BaseUtilityTermExtension)

export function addUtilityForType<T extends TermType>( t: T )
    : ( term: Term<ToPType<T>> ) => UtilityTermOf<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ){
        return addPAliasMethods as any;
        // return addUtilityForType( unwrapAlias( t ) ) as any;
    };

    if( typeExtends( t , bool ) ) return addPBoolMethods as any;
    if( typeExtends( t , bs   ) ) return addPByteStringMethods as any;
    if( typeExtends( t , int  ) ) return addPIntMethods as any;
    if( typeExtends( t , list( tyVar() ) ) ) return addPListMethods as any;
    if( typeExtends( t , pair( tyVar(), tyVar() ) ) ) return addPPairMethods as any;
    if( typeExtends( t , str  ) ) return addPStringMethods as any;

    if( typeExtends( t, lam( tyVar(), tyVar() )) )
    {
        return (( term: any ) => {
            term = addBaseUtilityTerm( term );

            return defineNonDeletableNormalProperty(
                term,
                "$",
                ( input: any ) =>
                    papp( term, input )
            ) as any;
        }) as any;
    }

    if( isStructType( t ) )
    {
        return addPStructMethods as any;
    }

    // no utility
    return ((x: any) => addBaseUtilityTerm( x )) as any;
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
    const originalType = aliasTerm.type;

    aliasTerm = addBaseUtilityTerm( aliasTerm );
    
    if( originalType[0] !== PrimType.Alias )
    {
        console.error( originalType );
        try {
            console.error( termTypeToString( originalType ) )
        }
        catch {}

        throw new Error("addPAliasMethods used on non-alias type");
    }

    const aliasedType = unwrapAlias( originalType );
    
    // intentionally discarding the result
    // if we are aliasing a list, adding utility clones the term
    // so changes the type
    // so we loose the alias and possible methods
    // this is really a bug in `addPListMethods`
    // but for now this is the workaround
    void addUtilityForType( aliasedType )( aliasTerm ) as any;
    void addUserMethods( aliasTerm, originalType[2] as AMethods );

    return aliasTerm as any;
}