import { PrimType, TermType, alias, asData, list, pair } from "../types";
import { getElemsT } from "./getElemsT";
import { getFstT } from "./getFstT";
import { getSndT } from "./getSndT";
import { unwrapAsData } from "./unwrapAsData";

/**
 * undoes the `asData` call
 */
export function clearAsData( t: TermType ): TermType
{
    // invalid asData type but not worth to rise an error
    if(
        t[0] === PrimType.Lambda ||
        t[0] === PrimType.Delayed
    ) return t;

    // already data
    if(
        t[0] === PrimType.Struct ||
        t[0] === PrimType.Data
    ) return t;

    t = unwrapAsData( t );

    if( t[0] === PrimType.Alias )
    {
        t = alias( clearAsData( t[1] ), t[2] );
    }
    else if( t[0] === PrimType.List )
    {
        const listElemsT = getElemsT( t );

        if( listElemsT[ 0 ] === PrimType.Pair )
        {
            const fstT = getFstT( listElemsT );
            const sndT = getSndT( listElemsT );
            t = list( pair( clearAsData( fstT ), clearAsData( sndT ) ) )
        }
        else
        {
            t = list( clearAsData( listElemsT ) )
        }
    }

    return t;
}