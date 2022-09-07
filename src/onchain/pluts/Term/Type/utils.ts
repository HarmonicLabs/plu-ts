import { Type as Ty, DataConstructor, DataType, PrimType, TypeName } from ".";


export function isTypeNameOfPrimitive( tyName: TypeName ): tyName is PrimType
{
    return (
        tyName === PrimType.Any     ||
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

export function isTypeNameOfData( tyName: TypeName ): tyName is DataConstructor
{
    return (
        tyName === DataConstructor.Any      ||
        tyName === DataConstructor.Constr   ||
        tyName === DataConstructor.Pair     ||
        tyName === DataConstructor.List     ||
        tyName === DataConstructor.Int      ||
        tyName === DataConstructor.BS
    );
}

export function isTypeName( tyName: TypeName ): tyName is TypeName
{
    return ( isTypeNameOfPrimitive( tyName ) || isTypeNameOfData( tyName ) );
}

export function isDataType( t: Ty ): t is DataType
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

export function isWellFormedType( t: Ty ): t is Ty
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

export function isListType( t: Ty ): t is [ PrimType.List, Ty ]
{
    return (
        Array.isArray( t ) &&
        t.length === 2 &&
        t[0] === PrimType.List &&
        isWellFormedType( t[ 1 ] )
    )
}

export function isDelayedType( t: Ty ): t is [ PrimType.Delayed, Ty ]
{
    return (
        Array.isArray( t ) &&
        t.length === 2 &&
        t[0] === PrimType.Delayed &&
        isWellFormedType( t[ 1 ] )
    )
}

export function isLambdaType( t: Ty ): t is [ PrimType.Lambda, Ty, Ty ]
{
    return (
        Array.isArray( t ) &&
        t.length === 3 &&
        t[0] === PrimType.Lambda &&
        isWellFormedType( t[ 1 ] ) && isWellFormedType( t[ 2 ] )
    );
}

export function isPairType( t: Ty ): t is [ PrimType.Pair, Ty, Ty ]
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
export function areTypesEquals( a: Ty, b: Ty ): boolean
{
    if(!(
        isWellFormedType( a ) &&
        isWellFormedType( b )
    )) return false;

    function uncheckedTyEq( _a: Ty, _b: Ty ): boolean
    {
        const aArgs = _a.slice( 1 ) as Ty[];
        return (
            _a[ 0 ] === _b[ 0 ] &&
            _a.length === _b.length &&
            ( b.slice(1) as Ty[] ).every( (bTyArg, idx) => uncheckedTyEq( aArgs[ idx ], bTyArg ) )
        );
    }

    return uncheckedTyEq( a, b )
}

export function dataTypeExtends( extending: DataType, extended: DataType ): boolean
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
export function typeExtends( extending: Ty, extended: Ty ): boolean
{
    if(!(
        isWellFormedType( extending ) &&
        isWellFormedType( extended  )
    )) return false;

    function unchecked( a: Ty, b: Ty ): boolean
    {
        if( b[0] === PrimType.Any ) return true;
        if( a[0] === PrimType.Any ) return false;

        if( isTypeNameOfData( b[0] ) )
        {
            if( !isTypeNameOfData( a[0] ) ) return false;

            // checks for correct data type construction;
            // actually already checked in the ```isWellFormedType``` call above
            return dataTypeExtends( a as any, b as any );
        }

        const bTyArgs = b.slice(1) as Ty[];
        return (
            a[ 0 ] === b[ 0 ] &&
            // a.length === b.length && // not a check because of ```PrimType.Any```
            ( a.slice( 1 ) as Ty[] ).every( (aTyArg, idx) => unchecked( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}

export function getNRequiredArgs( type: Ty ): number
{
    if( type[0] !== PrimType.Lambda ) return 0;

    return 1 + getNRequiredArgs( type[2] )
}