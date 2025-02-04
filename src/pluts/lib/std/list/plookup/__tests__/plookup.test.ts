import { pBool, pInt, pList, pPair, plookup, pmatch } from "../../../../.."
import { Machine, CEKConst } from "@harmoniclabs/plutus-machine";
import { pair, int, data } from "../../../../../../type_system";

function pMapInts( entries: [ number, number ][] )
{
    return pList( pair( int, int ) )
    ( entries.map( 
        ([ k, v ]) => pPair( int, int )( k, v ) 
    ))
}

const trueUplc = CEKConst.bool( true );
const falseUplc = CEKConst.bool( false );

const intsLookup = plookup( int, int );
const dataLookup = plookup( data, data );

describe("plookup", () => {


    function find4269( entries: [ number, number ][], _shouldFind?: boolean )
    {
        const shouldFind = _shouldFind ?? entries.some( ([ k, v ]) => k === 42 && v === 69 );
        const expected = shouldFind ? trueUplc : falseUplc ;

        const term = pMapInts( entries );

        test( JSON.stringify( entries ) + " " + shouldFind, () => {
            expect(
                Machine.evalSimple(
                    pmatch(
                        intsLookup.$( 42 ).$( term )
                    )
                    .onJust(({ val }) => val.eq( 69 ))
                    .onNothing( _ => pBool( false ) )
                )
            ).toEqual( expected )
        })
    }

    find4269([]);
    find4269([[42, 69]]);
    find4269([
        [2, 69],
        [22, 69],
        [69, 69],
        [42, 69]
    ]);
    find4269([
        [2, 69],
        [22, 69],
        [69, 69]
    ]);
    find4269([
        [2, 69],
        [22, 69],
        [42, 42]
    ]);
    find4269([
        [2, 69],
        [22, 69],
        [42, 69],
        [42, 42],
    ]);
    find4269([
        [2, 69],
        [22, 69],
        [42, 42],
        [42, 69]
    ], false);

})