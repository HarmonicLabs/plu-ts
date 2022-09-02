import { Type as Ty, DataConstructor, DataType, PrimType, TypeName } from ".";


export function isTypeNameOfPrimitive( tyName: TypeName ): tyName is PrimType
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

export function isTypeNameOfData( tyName: TypeName ): tyName is DataConstructor
{
    return (
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
            t[ 0 ] === DataConstructor.BS   ||
            t[ 0 ] === DataConstructor.Int
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
    
    return (
        t[ 0 ] === DataConstructor.Constr &&
        ( t.slice( 1 ) as Ty[] ).every( isDataType )
    );
}

export function isWellFormedType( t: Ty ): t is Ty
{
    if(!( Array.isArray( t ) && t.length > 0 &&  isTypeName( t[0] ) )) return false;
    
    if( t.length === 1) return true;
    if( isDataType( t ) ) return true;

    // DataConstructor.Constr can be of indefinite length
    if( t.length > 3 ) return false;

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