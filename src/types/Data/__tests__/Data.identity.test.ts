import { Data, DataPair } from "..";
import { fromAscii, fromUtf8 } from "@harmoniclabs/uint8array-utils";
import { DataB } from "../DataB";
import { DataConstr } from "../DataConstr";
import { DataI } from "../DataI";
import { DataList } from "../DataList";
import { DataMap } from "../DataMap";
import { dataFromCbor, dataFromCborObj } from "../fromCbor";
import { dataToCbor, dataToCborObj } from "../toCbor";

function identityTestFor( data: Data ): void
{
    expect(
        dataFromCborObj(
            dataToCborObj(
                data
            )
        )
    ).toEqual( data );

    expect(
        dataFromCbor(
            dataToCbor(
                data
            )
        )
    ).toEqual( data );
}

describe( "dataFromCborObj( dataToCborObj( data ) ) === data", () => {
    
    test( "DataI", () => {

        identityTestFor(new DataI( 0 ));
        identityTestFor(new DataI( 1 ));
        identityTestFor(new DataI( -1 ));

        identityTestFor(new DataI( Number.MAX_SAFE_INTEGER ));
        identityTestFor(new DataI( BigInt( Number.MAX_SAFE_INTEGER ) << BigInt( 2 ) ));

        identityTestFor(new DataI( -Number.MAX_SAFE_INTEGER ));
        identityTestFor(new DataI( -( BigInt( Number.MAX_SAFE_INTEGER ) << BigInt( 2 ) ) ));

    })

    test( "DataB", () => {

        identityTestFor(new DataB( new Uint8Array(0) ));
        identityTestFor(new DataB( fromAscii( "some token name" ) ));
        
    })

    test( "DataList", () => {

        identityTestFor(new DataList([]));

        identityTestFor(new DataList([
            new DataI( 0 )
        ]));

        identityTestFor(new DataList([
            new DataI( 1 ),
            new DataI( 2 ),
            new DataI( 3 ),
        ]));

        identityTestFor(new DataList([
            new DataI( 1 ),
            new DataB( new Uint8Array(0) ),
        ]));

        identityTestFor(new DataList([
            new DataList([
                new DataList([
                    new DataI( 42 )
                ])
            ]),
        ]));

    })

    test.skip( "DataMap", () => {

        identityTestFor(new DataMap([]));

        identityTestFor(new DataMap([
            new DataPair( new DataI( 0 ), new DataB( fromUtf8( "hello" ) ) )
        ]));

        identityTestFor(new DataMap([
            new DataPair( new DataI( 0 ), new DataB( fromUtf8( "hello" ) ) ),
            new DataPair( new DataI( 1 ), new DataB( fromUtf8( "world" ) ) )
        ]));

        identityTestFor(new DataMap([
            new DataPair( new DataB( fromAscii( "pubKey1" ) ), new DataI( 0 ) ),
            new DataPair( new DataB( fromAscii( "pubKey2" ) ), new DataI( 42 ) ),
            new DataPair( new DataB( fromAscii( "pubKey3" ) ), new DataI( 69 ) ),
            new DataPair( new DataB( fromAscii( "pubKey4" ) ), new DataI( 420 ) ),
        ]));

    })

    test( "DataConstr", () => {

        identityTestFor(new DataConstr( 0 , [] )); // data unit

        identityTestFor(new DataConstr( 6 , [] ));
        identityTestFor(new DataConstr( 7 , [] ));

        identityTestFor(new DataConstr( 127 , [] ));
        identityTestFor(new DataConstr( 128 , [] ));

        identityTestFor(new DataConstr( 54321 , [] ));
        identityTestFor(new DataConstr( Number.MAX_SAFE_INTEGER , [] ));

        identityTestFor(
            new DataConstr(
                0 , 
                [
                    new DataI( 42 ),
                ]
            )
        );
        
    })
})