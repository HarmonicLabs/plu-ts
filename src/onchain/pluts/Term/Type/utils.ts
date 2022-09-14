import Type, {
    TermType,
    DataConstructor,
    DataType,
    PrimType,
    TypeName,
    FixedDataTypeName,
    FixedTypeName,
    FixedTermType,
    FixedTermDataType,
    ConstantableTermType,
    TermTypeParameter
} from ".";
import JsRuntime from "../../../../utils/JsRuntime";
import ConstType, { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";

export function isTypeParam( tyName: TypeName ): tyName is TermTypeParameter
{
    return (typeof tyName === "symbol");
}

export function isFixedTypeNameOfPrim( tyName: TypeName ): tyName is FixedTypeName
{
    return (
        tyName === PrimType.Int     ||
        tyName === PrimType.BS      ||
        tyName === PrimType.Str     ||
        tyName === PrimType.Unit    ||
        tyName === PrimType.Bool    ||
        tyName === PrimType.List    ||
        tyName === PrimType.Pair    ||
        tyName === PrimType.Delayed ||
        tyName === PrimType.Lambda
    );
}

export function isTypeNameOfPrimitive( tyName: TypeName ): tyName is PrimType
{
    return (
        tyName === PrimType.Any     ||
        isFixedTypeName( tyName )
    );
}

export function isFixedDataTypeName( tyName: TypeName ): tyName is FixedDataTypeName
{
    return (
        tyName === DataConstructor.Constr   ||
        tyName === DataConstructor.Pair     ||
        tyName === DataConstructor.List     ||
        tyName === DataConstructor.Int      ||
        tyName === DataConstructor.BS
    );
}

export function isTypeNameOfData( tyName: TypeName ): tyName is DataConstructor
{
    return (
        tyName === DataConstructor.Any      ||
        isFixedDataTypeName( tyName )
    );
}

export function isTypeName( tyName: TypeName ): tyName is TypeName
{
    return (
        isTypeNameOfPrimitive( tyName ) ||
        isTypeNameOfData( tyName )      ||
        isTypeParam( tyName )
    );
}

export function isFixedTypeName( tyName: TypeName ): tyName is FixedTypeName
{
    return ( isFixedTypeNameOfPrim( tyName ) || isFixedDataTypeName( tyName ) )
}

export function isFixedDataType( t: TermType ): t is FixedTermDataType
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isFixedDataTypeName( t[0] ) )) return false;
    if( t.length === 1 )
    {
        return (
            t[ 0 ] === DataConstructor.Constr   ||
            t[ 0 ] === DataConstructor.BS       ||
            t[ 0 ] === DataConstructor.Int
        )
    }
    if( t.length === 2 )
        return (
            t[0] === DataConstructor.List &&
            isFixedDataType( t[ 1 ] )
        );
    if( t.length === 3 )
        return (
            t[ 0 ] === DataConstructor.Pair &&
            isFixedDataType( t[ 1 ] ) && isFixedDataType( t[ 2 ] )
        );
    
    return false;
}

export function isFixedType( t: TermType ): t is FixedTermType
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isFixedTypeName( t[0] ) )) return false;
    
    if( isFixedDataType( t ) ) return true;
    
    if( t.length === 1) return (
        t[ 0 ] === PrimType.BS      ||
        t[ 0 ] === PrimType.Bool    ||
        t[ 0 ] === PrimType.Int     ||
        t[ 0 ] === PrimType.Str     ||
        t[ 0 ] === PrimType.Unit
    );    
    if( t.length > 3 ) return false;
    
    if( t.length === 2 )
    {        
        if(
            t[0] === PrimType.List    ||
            t[0] === PrimType.Delayed
        )
        {
            return isFixedType( t[ 1 ] );
        }

        return false;
    }

    if( t.length === 3 )
    {
        return (
            (
                t[0] === PrimType.Pair   ||
                t[0] === PrimType.Lambda
            ) &&
            isFixedType( t[ 1 ] ) && isFixedType( t[ 2 ] )
        )
    }

    return false;
}

export function isDataType( t: TermType ): t is DataType
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isTypeNameOfData( t[0] ) )) return false;
    if( t.length === 1 )
    {
        return (
            t[ 0 ] === DataConstructor.Constr   ||
            t[ 0 ] === DataConstructor.BS       ||
            t[ 0 ] === DataConstructor.Int      ||
            t[ 0 ] === DataConstructor.Any
        )
    }
    if( t.length === 2 )
        return (
            t[0] === DataConstructor.List &&
            isDataType( t[ 1 ] )
        );
    if( t.length === 3 )
        return (
            t[ 0 ] === DataConstructor.Pair &&
            isDataType( t[ 1 ] ) && isDataType( t[ 2 ] )
        );
    
    return false;
}

export function isConstantableTermType( t: TermType ): t is ConstantableTermType
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isTypeName( t[0] ) )) return false;

    // any data can be constant
    if( isDataType( t ) ) return true;

    if( t.length === 1) return (
        t[ 0 ] === PrimType.BS      ||
        t[ 0 ] === PrimType.Bool    ||
        t[ 0 ] === PrimType.Int     ||
        t[ 0 ] === PrimType.Str     ||
        t[ 0 ] === PrimType.Unit
    );  
    if( t.length > 3 ) return false;

    if( t.length === 2 )
    {        
        return ( t[0] === PrimType.List && isConstantableTermType( t[ 1 ] ) );
    }

    if( t.length === 3 )
    {
        return (
            t[0] === PrimType.Pair &&
            isConstantableTermType( t[ 1 ] ) && isConstantableTermType( t[ 2 ] )
        );
    }

    return false;
}

export function isWellFormedType( t: TermType ): t is TermType
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isTypeName( t[0] ) )) return false;
    
    if( t.length === 1) return true;    
    if( t.length > 3 ) return false;
    
    if( isDataType( t ) ) return true;
    if( t.length === 2 )
    {        
        if(
            t[0] === PrimType.List    ||
            t[0] === PrimType.Delayed
        )
        {
            return isWellFormedType( t[ 1 ] );
        }

        return false;
    }

    if( t.length === 3 )
    {
        return (
            (
                t[0] === PrimType.Pair   ||
                t[0] === PrimType.Lambda
            ) &&
            isWellFormedType( t[ 1 ] ) && isWellFormedType( t[ 2 ] )
        )
    }

    return false;
}

export function isListType( t: TermType ): t is [ PrimType.List, TermType ]
{
    return (
        Array.isArray( t ) &&
        t.length === 2 &&
        t[0] === PrimType.List &&
        isWellFormedType( t[ 1 ] )
    )
}

export function isDelayedType( t: TermType ): t is [ PrimType.Delayed, TermType ]
{
    return (
        Array.isArray( t ) &&
        t.length === 2 &&
        t[0] === PrimType.Delayed &&
        isWellFormedType( t[ 1 ] )
    )
}

export function isLambdaType( t: TermType ): t is [ PrimType.Lambda, TermType, TermType ]
{
    return (
        Array.isArray( t ) &&
        t.length === 3 &&
        t[0] === PrimType.Lambda &&
        isWellFormedType( t[ 1 ] ) && isWellFormedType( t[ 2 ] )
    );
}

export function isPairType( t: TermType ): t is [ PrimType.Pair, TermType, TermType ]
{
    return (
        Array.isArray( t ) &&
        t.length === 3 &&
        t[0] === PrimType.Pair &&
        isWellFormedType( t[ 1 ] ) && isWellFormedType( t[ 2 ] )
    );
}

/**
 * @deprecated use ```typeExtends``` instead
 */
export function areTypesEquals( a: TermType, b: TermType ): boolean
{
    if(!(
        isWellFormedType( a ) &&
        isWellFormedType( b )
    )) return false;

    function uncheckedTyEq( _a: TermType, _b: TermType ): boolean
    {
        const aArgs = _a.slice( 1 ) as TermType[];
        return (
            _a[ 0 ] === _b[ 0 ] &&
            _a.length === _b.length &&
            ( b.slice(1) as TermType[] ).every( (bTyArg, idx) => uncheckedTyEq( aArgs[ idx ], bTyArg ) )
        );
    }

    return uncheckedTyEq( a, b )
}

/**
 * **pure**
 */
export function replaceTypeParam( tyParam: Readonly<TermTypeParameter> | [ Readonly<TermTypeParameter> ] , withTermType: Readonly<FixedTermType>, toBeReplacedIn: Readonly<TermType> ): TermType
{
    JsRuntime.assert(
        isFixedType( withTermType ),
        "cannot replace a type paramter with a non fixed TermType"
    );

    if( typeof tyParam !== "symbol" ) tyParam = tyParam[0];

    function unchecked( param: Readonly<TermTypeParameter>, toReplace: Readonly<FixedTermType>, toBeReplaced: Readonly<TermType> ): TermType
    {
        if( toBeReplaced[ 0 ] === param ) // 'symbol' equality
        {
            return toReplace; // replacing here
        }

        if( toBeReplaced.length === 1 ) return Object.freeze([ ...toBeReplaced ]);
        if( toBeReplaced.length === 2 )
        {
            if( toBeReplaced[ 0 ] === PrimType.List )
                return Type.List(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Delayed )
                return Type.Delayed(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] )
                );
            
            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected type while replacing parameter, " +
                "'toBeReplaced' was expected to have one type argument " +
                "but none of the types that require one matched the type;" +
                "\n'toBeReplaced' was : " + toBeReplaced
            );
        }
        if( toBeReplaced.length === 3 )
        {
            if( toBeReplaced[ 0 ] === PrimType.Lambda )
                return Type.Lambda(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] ),
                    unchecked( param, toReplace, toBeReplaced[ 2 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Pair )
                return Type.Pair(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] ),
                    unchecked( param, toReplace, toBeReplaced[ 2 ] )
                );

            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected type while replacing parameter, " +
                "'toBeReplaced' was expected to have two type argument " +
                "but none of the types that require two matched the type;" +
                "\n'toBeReplaced' was : " + toBeReplaced
            );
        }

        throw JsRuntime.makeNotSupposedToHappenError(
            "unexpected type while replacing parameter, " +
            "'toBeReplaced' required more than two type argumetns, " +
            "but none are defined so;" +
            "\n'toBeReplaced' was : " + toBeReplaced
        );
    }

    return unchecked( tyParam, withTermType, toBeReplacedIn );
}

export function dataTypeExtends<ExtendedDataTy extends DataType>( extending: DataType, extended: ExtendedDataTy ): extending is ExtendedDataTy
{
    if(!(
        isDataType( extended  ) &&
        isDataType( extending )
    )) return false;

    function unchecked( a: DataType, b: DataType ): boolean
    {
        if( b[ 0 ] === DataConstructor.Any ) return true;
        if( a[ 0 ] === DataConstructor.Any ) return false;

        const bTyArgs = b.slice( 1 ) as DataType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            a.length === b.length &&
            ( a.slice( 1 ) as DataType[] ).every( (aTyArg, idx) => dataTypeExtends( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}

/*
 * equivalent to ```A extends B``` but at plu-ts level
 */
export function typeExtends<ExtendedTy extends TermType>( extending: TermType, extended: ExtendedTy ): extending is ExtendedTy
{
    if(!(
        isWellFormedType( extending ) &&
        isWellFormedType( extended  )
    )) return false;

    const paramsMem: {
        tyVarExtended: symbol
        tyArgExtending: TermType
    }[] = [];

    function unchecked( a: TermType, b: TermType ): boolean
    {
        if( b[0] === PrimType.Any ) return true;

        if( isTypeParam( b[0] ) )
        {
            if( b[0] === a[0] ) return true; // same symbol

            const thisTyArg = paramsMem.find( knownParam => knownParam.tyVarExtended === b[0] );
            let arg = thisTyArg?.tyArgExtending; 
            if( arg === undefined )
            {
                paramsMem.push({
                    tyVarExtended: b[0],
                    tyArgExtending: a // fixme; on unknown take most generic typaram present
                })
                return true; 
            }
            if( unchecked( arg, a ) )
            {
                // this type argument is more general than the registered one
                (thisTyArg as any).tyArgExtending = a;
                return true;
            }
            return unchecked( a, arg );
        }

        if( a[0] === PrimType.Any ) return false;

        if( isTypeNameOfData( b[0] ) )
        {
            if( !isTypeNameOfData( a[0] ) ) return false;

            // checks for correct data type construction;
            // actually already checked in the ```isWellFormedType``` call above
            return dataTypeExtends( a as any, b as any );
        }

        const bTyArgs = b.slice(1) as TermType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            // a.length === b.length && // not a check because of possible ```PrimType.Any``` as type arguments
            ( a.slice( 1 ) as TermType[] ).every( (aTyArg, idx) => unchecked( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}

export function getNRequiredLambdaArgs( type: TermType ): number
{
    if( type[0] !== PrimType.Lambda ) return 0;

    return 1 + getNRequiredLambdaArgs( type[2] )
}

/**
 * @deprecated use ```getNRequiredLambdaArgs```
 */
export const getNRequiredArgs = getNRequiredLambdaArgs;

export function termTyToConstTy( termT: ConstantableTermType ): ConstType
{
    JsRuntime.assert(
        isConstantableTermType( termT ),
        `cannot convert "${termT}" {TermType} to {ConstType}`
    );

    function unchecked( t: ConstantableTermType ): ConstType
    {
        if( typeExtends( t, Type.BS ) ) return constT.byteStr;
        if( typeExtends( t, Type.Int ) ) return constT.int;
        if( typeExtends( t, Type.Str ) ) return constT.str;
        if( typeExtends( t, Type.Unit ) ) return constT.unit;
        if( typeExtends( t, Type.Bool ) ) return constT.bool;
        if( typeExtends( t, Type.Data.Any ) ) return constT.data;
        if( typeExtends( t, Type.List( Type.Any ) ) ) return constT.listOf( unchecked( t[1] as any ) );
        if( typeExtends( t, Type.Pair( Type.Any, Type.Any ) ) ) return constT.pairOf( unchecked( t[1] as any ), unchecked( t[2] as any ) );

        throw JsRuntime.makeNotSupposedToHappenError(
            "'termTyToConstTy' couldn't match a TermType to convert to ConstType; input TermType was: " + t
        );
    }

    return unchecked( termT );
}