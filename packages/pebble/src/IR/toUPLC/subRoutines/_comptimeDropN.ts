import { IRHoisted, IRFunc, IRNative, IRVar } from "../../IRNodes";
import { _ir_apps } from "../../tree_utils/_ir_apps";


export const hoisted_drop2 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop2.hash;

export const hoisted_drop3 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                _ir_apps(
                    IRNative.tailList,
                    new IRVar( 0 ) // lst
                )
            )
        )
    )
);
hoisted_drop3.hash;

export const hoisted_drop4 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                _ir_apps(
                    IRNative.tailList,
                    _ir_apps(
                        IRNative.tailList,
                        new IRVar( 0 ) // lst
                    )
                )
            )
        )
    )
);
hoisted_drop4.hash;

export const hoisted_drop8 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop4.clone(),
            _ir_apps(
                hoisted_drop4.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop8.hash;

export const hoisted_drop16 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop8.clone(),
            _ir_apps(
                hoisted_drop8.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop16.hash;

export const hoisted_drop32 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop16.clone(),
            _ir_apps(
                hoisted_drop16.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop32.hash;

export function _compTimeDropN( bigN: bigint ): IRHoisted | IRNative
{
    const n = Number( bigN );
    if( n < 0 ) throw new Error(`Cannot drop a negative number of elements from a list`);
    if( n === 0 ) return new IRHoisted(
        new IRFunc( 1, new IRVar( 0 ) )
    );
    if( n === 1 ) return IRNative.tailList;
    if( n === 2 ) return hoisted_drop2;
    if( n === 3 ) return hoisted_drop3;
    if( n === 4 ) return hoisted_drop4;
    if( n === 8 ) return hoisted_drop8;
    if( n === 16 ) return hoisted_drop16;
    if( n === 32 ) return hoisted_drop32;

    // Greedy decomposition into available drop sizes (largest first)
    let remaining = n;
    const parts: number[] = [];
    const sizes = [32,16,8,4,3,2,1];
    for( const s of sizes )
    {
        while( remaining >= s )
        {
            parts.push( s );
            remaining -= s;
        }
        if( remaining === 0 ) break;
    }

    // Build the composed drop function body by sequential application
    let body: any = new IRVar( 0 ); // start from the input list (var 0)
    for( const p of parts )
    {
        switch( p )
        {
            case 32: body = _ir_apps( hoisted_drop32.clone(), body ); break;
            case 16: body = _ir_apps( hoisted_drop16.clone(), body ); break;
            case 8: body = _ir_apps( hoisted_drop8.clone(), body ); break;
            case 4: body = _ir_apps( hoisted_drop4.clone(), body ); break;
            case 3: body = _ir_apps( hoisted_drop3.clone(), body ); break;
            case 2: body = _ir_apps( hoisted_drop2.clone(), body ); break;
            case 1: body = _ir_apps( IRNative.tailList, body ); break;
        }
    }

    const hoisted = new IRHoisted( new IRFunc( 1, body ) );
    hoisted.hash; // force hash computation / caching as done for predefined ones
    return hoisted;
}