export type CanBeUInteger
    = bigint
    | number;

export function canBeUInteger( something: any ): something is (number | bigint)
{
    return (
        (typeof something === "bigint" && something >= BigInt( 0 ) ) ||
        (typeof something === "number" && something === Math.round( Math.abs( something ) ) )
    );
}

export function forceBigUInt( toForce: CanBeUInteger ): bigint
{
    if( !canBeUInteger( toForce ) )
    {
        // console.error( toForce );
        throw new Error( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return BigInt( toForce );
};

export function unsafeForceUInt( toForce: CanBeUInteger ): number
{
    if( !canBeUInteger( toForce ) )
    {
        // console.error( toForce );
        throw new Error( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return Number( toForce ); 
}