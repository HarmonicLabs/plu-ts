import JsRuntime from "../../../../utils/JsRuntime";
import { Type, ConstantableTermType, TypeShortcut, data } from "./base";
import { ConstType, constPairTypeUtils, constT, constTypeEq, ConstTyTag } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { unwrapAlias } from "../../PTypes/PAlias/unwrapAlias";
import { typeExtends } from "./extension";
import { isAliasType, isConstantableTermType } from "./kinds";
import { termTypeToString } from "./utils";


export function termTyToConstTy( termT: ConstantableTermType ): ConstType
{
    JsRuntime.assert(
        isConstantableTermType( termT ),
        `cannot convert "${termTypeToString( termT )}" {TermType} to {ConstType}`
    );

    function unchecked( t: ConstantableTermType ): ConstType
    {
        if( isAliasType( t ) ) return unchecked( unwrapAlias( t ) );
        if( typeExtends( t, Type.BS ) ) return constT.byteStr;
        if( typeExtends( t, Type.Int ) ) return constT.int;
        if( typeExtends( t, Type.Str ) ) return constT.str;
        if( typeExtends( t, Type.Unit ) ) return constT.unit;
        if( typeExtends( t, Type.Bool ) ) return constT.bool;
        if( typeExtends( t, Type.Data.Any ) ) return constT.data;
        if( typeExtends( t, Type.List( Type.Any ) ) ) return constT.listOf( unchecked( t[1] as any ) );
        if( typeExtends( t, Type.PairAsData( Type.Any, Type.Any ) ) ) return constT.pairOf( constT.data, constT.data );
        if( typeExtends( t, Type.Pair( Type.Any, Type.Any ) ) ) return constT.pairOf( unchecked( t[1] as any ), unchecked( t[2] as any ) );

        throw JsRuntime.makeNotSupposedToHappenError(
            "'termTyToConstTy' couldn't match a TermType to convert to ConstType; input TermType was: " + termTypeToString( t )
        );
    }

    return unchecked( termT );
}

const { bool, int, unit, str, bs } = TypeShortcut;

export function constTyToTermTy( t: ConstType ): ConstantableTermType
{
    if( constTypeEq( t, constT.data ) )
    {
        // @todo

        return Type.Data.Any;
    }

    if( constTypeEq( t, constT.bool ) ) return bool;
    if( constTypeEq( t, constT.byteStr ) ) return bs;
    if( constTypeEq( t, constT.int ) ) return int;
    if( constTypeEq( t, constT.str ) ) return str;
    if( constTypeEq( t, constT.unit ) ) return unit;
    

    if( t[0] === ConstTyTag.list ) return Type.List( constTyToTermTy( t.slice( 1 ) as any ) );
    
    if( t[0] === ConstTyTag.pair ) return Type.Pair(
        constTyToTermTy( constPairTypeUtils.getFirstTypeArgument( t ) ),
        constTyToTermTy( constPairTypeUtils.getSecondTypeArgument( t ) )
    );

    throw JsRuntime.makeNotSupposedToHappenError(
        "'constTyToTermTy' did not matched any constant type"
    );
}