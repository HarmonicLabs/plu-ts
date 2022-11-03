import PType from "../../PType";
import { PAlias, unwrapAlias } from "../../PTypes/PAlias";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList";
import PString from "../../PTypes/PString";
import { ConstantableStructDefinition, PStruct } from "../../PTypes/PStruct";
import Term from "../../Term";
import Type, { bool, bs, ConstantableTermType, int, list, str, TermType, ToPType } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/extension";
import { isAliasType, isConstantableStructType, isStructType } from "../../Term/Type/kinds";
import TermBool, { addPBoolMethods } from "./TermBool";
import TermBS, { addPByteStringMethods } from "./TermBS";
import TermInt, { addPIntMethods } from "./TermInt";
import TermList, { addPListMethods } from "./TermList";
import TermStr, { addPStringMethods } from "./TermStr";
import TermStruct, { addPStructMethods } from "./TermStruct";


export type UtilityTermOf<PElem extends PType> = 
    (
        PElem extends PAlias<infer T extends ConstantableTermType, infer Sym, infer Class> ? UtilityTermOf<ToPType<T>> & Term<PAlias<T,Sym,Class>> :
        PElem extends PBool ? TermBool :
        PElem extends PByteString ? TermBS : 
        PElem extends PInt ? TermInt :
        PElem extends PList<infer PListElem extends PType> ? TermList<PListElem> :
        PElem extends PString ? TermStr :
        PElem extends PStruct<infer SDef extends ConstantableStructDefinition> ? TermStruct<SDef> :
        Term<PElem>
    ) & Term<PElem> // needed because sometime typescript doesn' recognize that the term is the same just extended

export default function addUtilityForType<T extends TermType>( t: T )
    : ( term: Term<ToPType<T>> ) => UtilityTermOf<ToPType<T>>
{
    if( isAliasType( t ) ) return addUtilityForType( unwrapAlias( t ) ) as any;

    if( typeExtends( t , bool ) ) return addPBoolMethods as any;
    if( typeExtends( t , bs   ) ) return addPByteStringMethods as any;
    if( typeExtends( t , int  ) ) return addPIntMethods as any;
    if( typeExtends( t , list( Type.Any ) ) ) return addPListMethods as any;
    if( typeExtends( t , str  ) ) return addPStringMethods as any;

    const id = ((x: any) => x);

    if( isStructType( t ) )
    {
        if( !isConstantableStructType( t ) ) return id as any;

        return addPStructMethods as any;
    }

    return id as any;
}