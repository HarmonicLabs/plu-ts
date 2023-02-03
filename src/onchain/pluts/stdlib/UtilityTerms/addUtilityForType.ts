import ObjectUtils from "../../../../utils/ObjectUtils";

import type { PLam, PPair } from "../..";
import { PType }  from "../../PType";
import { PStruct } from "../../PTypes/PStruct/pstruct";
import { papp } from "../../Syntax";
import { PappArg } from "../../Syntax/pappArg";
import { Type, AliasTermType, bool, bs, ConstantableStructDefinition, ConstantableTermType, int, list, pair, str, TermType } from "../../Term/Type/base";
import { typeExtends } from "../../Term/Type/extension";
import { isAliasType, isConstantableStructType, isLambdaType, isStructType } from "../../Term/Type/kinds";
import { ToPType } from "../../Term/Type/ts-pluts-conversion";
import { PAlias } from "../../PTypes/PAlias/palias";
import { unwrapAlias } from "../../PTypes/PAlias/unwrapAlias";
import { PBool } from "../../PTypes/PBool";
import { PByteString } from "../../PTypes/PByteString";
import { PInt } from "../../PTypes/PInt";
import { PList } from "../../PTypes/PList";
import { PString } from "../../PTypes/PString";
import { Term } from "../../Term";
import { TermAlias } from "./TermAlias";
import { TermBool, addPBoolMethods } from "./TermBool";
import { TermBS, addPByteStringMethods } from "./TermBS";
import { TermInt, addPIntMethods } from "./TermInt";
import { TermList, addPListMethods } from "./TermList";
import { TermPair, addPPairMethods } from "./TermPair";
import { TermStr, addPStringMethods } from "./TermStr";
import { TermStruct, addPStructMethods } from "./TermStruct";

// given the index returns the previous number ( PrevNum[2] -> 1; etc... )
type PrevNum = [ never, 0, 1, 2, 3, 4, 5, 6 ];

// without the "finite" version typescript gets angry and says the type is too complex to be evaluated
type FiniteTermAlias<T extends ConstantableTermType, AliasId extends symbol, MaxDepth extends PrevNum[number] = 6> =
    MaxDepth extends never ? never :
    T extends AliasTermType<symbol, infer ActualT extends ConstantableTermType> ?
        // @ts-ignore
        FiniteTermAlias<ActualT, AliasId, PrevNum[MaxDepth]> :
        TermAlias<T,AliasId>

export type UtilityTermOf<PElem extends PType> = 
    (
        PElem extends PBool ? TermBool :
        PElem extends PByteString ? TermBS : 
        PElem extends PInt ? TermInt :
        PElem extends PList<infer PListElem extends PType> ? TermList<PListElem> :
        PElem extends PPair<infer PFst extends PType,infer PSnd extends PType> ? TermPair<PFst,PSnd> :
        PElem extends PString ? TermStr :
        PElem extends PStruct<infer SDef extends ConstantableStructDefinition> ? TermStruct<SDef> :
        PElem extends PLam<infer PInput extends PType, infer POutput extends PType> ?
            Term<PElem> & {
                $: ( input: PappArg<PInput> ) => UtilityTermOf<POutput>
            } :
        PElem extends PAlias<infer T extends ConstantableTermType, infer AliasId extends symbol, any> ? FiniteTermAlias<T, AliasId> :
        Term<PElem>
    ) & Term<PElem> // needed because sometime typescript doesn't understands that the term is the same just extended

export function addUtilityForType<T extends TermType>( t: T )
    : ( term: Term<ToPType<T>> ) => UtilityTermOf<ToPType<T>>
{
    if( isAliasType( t ) ) return addUtilityForType( unwrapAlias( t ) ) as any;

    if( typeExtends( t , bool ) ) return addPBoolMethods as any;
    if( typeExtends( t , bs   ) ) return addPByteStringMethods as any;
    if( typeExtends( t , int  ) ) return addPIntMethods as any;
    if( typeExtends( t , list( Type.Any ) ) ) return addPListMethods as any;
    if( typeExtends( t , pair( Type.Any, Type.Any ) ) ) return addPPairMethods as any;
    if( typeExtends( t , str  ) ) return addPStringMethods as any;

    if( isLambdaType( t ) )
    {
        return (( term: any ) => ObjectUtils.defineNonDeletableNormalProperty(
            term,
            "$",
            ( input: any ) =>
                // @ts-ignore type instantiation is to deep and possibly infinite
                papp( term, input )
        )) as any;
    }

    const id = ((x: any) => x);

    if( isStructType( t ) )
    {
        if( !isConstantableStructType( t ) ) return id as any;

        return addPStructMethods as any;
    }

    return id as any;
}