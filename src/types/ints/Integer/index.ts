import { BasePlutsError } from "../../../errors/BasePlutsError";

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
    if( toForce < 0 )
    {
        // console.error( toForce );
        throw new BasePlutsError( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return BigInt( typeof toForce === "number" ? Math.round( toForce ) : toForce );
};