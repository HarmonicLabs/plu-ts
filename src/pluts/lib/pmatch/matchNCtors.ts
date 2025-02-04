import { IRApp, IRConst, IRDelayed, IRError, IRForced, IRFunc, IRHoisted, IRNative, IRTerm, IRVar } from "../../../IR";
import { PType } from "../../PType";
import { Term } from "../../Term";
import { LamT, PrimType, TermType, data, fn, lam, list } from "../../../type_system/types";


export function matchNCtorsIdxs( _n: number, returnT: TermType ): Term<PType>
{
    if( _n <= 1 ) throw new Error("mathcing ill formed struct data");
    const n = Math.round( _n );
    if( _n !== n ) throw new Error("number of ctors to match must be an integer");

    // if( matchNCtorsIdxsCache[n] !== undefined ) return matchNCtorsIdxsCache[n];

    const continuationT = lam( list(data), returnT );

    // built immediately; not at compilation

    // all this mess just to allow hoisting
    // you have got to reason backwards to understand the process

    let body: IRTerm = new IRError("matchNCtorsIdxs; unmatched");

    for(let i = n - 1; i >= 0; i-- )
    {
        // pif( continuationT ).$( isCtorIdx.$( pInt( i ) ) )
        // .then( continuation_i )
        // .else( ... )
        body = new IRForced(
            new IRApp(
                new IRApp(
                    new IRApp(
                        IRNative.strictIfThenElse,
                        new IRApp(
                            new IRVar( 0 ),         // isCtorIdx // last variable introduced (see below)
                            IRConst.int( i )        // .$( pInt( i ) )
                        )
                    ),
                    new IRDelayed( new IRVar(
                        2 + // isCtorIdx and structConstrPair are in scope
                        i   // continuation_i
                    ) ) // then matching continuation
                ),
                new IRDelayed( body ) // else go check the next index; or error if it was last possible index
            )
        );
    }

    // plet( peqInt.$( pfstPir(...).$( structConstrPair ) ) ).in( isCtorIdx => ... )
    body = new IRApp(
        new IRFunc( 1, // isCtorIdx
            body
        ),
        // peqInt.$( pfstPir(...).$( structConstrPair ) )
        new IRApp(
            IRNative.equalsInteger,
            new IRApp(
                IRNative.fstPair,
                new IRVar( 0 ) // structConstrPair // last variable introduced (see below)
            )
        )
    );

    // <whatever continuation was matched>.$( psndPair(...).$( structConstrPair ) )
    // aka passing the fields to the continuation
    body = new IRApp(
        body,
        new IRApp(
            IRNative.sndPair,
            new IRVar( 0 ), // structConstrPair // last variable introduced (see below)
        )
    );

    // plet( punConstrData.$( structData ) )  ).in( structConstrPair => ... )
    body = new IRApp(
        new IRFunc( 1, // structConstrPair
            body
        ),
        new IRApp(
            IRNative.unConstrData,
            new IRVar( n ) // structData
        )
    );

    for(let i = n - 1; i >= 0; i-- )
    {
        body = new IRFunc( 1, // continuation n - 1 - i
            body
        );
    }

    // seriously, all this mess for this IRHoisted
    body = new IRHoisted(
        new IRFunc( 1, // structData
            body
        ),
        { name: "match_" + n + "_ctors" }
    );

    type ContinuationT = LamT<[PrimType.List, [PrimType.Data]], TermType>

    body.hash;
    const term = new Term(
        fn([
            data,
            ...(new Array( n ).fill( continuationT )) as [ ContinuationT, ...ContinuationT[] ]
        ],  returnT) as any,
        _dbn => body.clone()
    );

    // save in cache
    // matchNCtorsIdxsCache[n] = term;

    return term;
}