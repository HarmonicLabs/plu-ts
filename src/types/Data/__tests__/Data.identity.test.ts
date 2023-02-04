import { Data } from "..";
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

        identityTestFor(new DataB( Buffer.from( [] ) ));
        identityTestFor(new DataB( Buffer.from( "some token name", "ascii" ) ));
        
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
            new DataB( Buffer.from( [] ) ),
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
            [ new DataI( 0 ), new DataB( Buffer.from( "hello" ) ) ]
        ]));

        identityTestFor(new DataMap([
            [ new DataI( 0 ), new DataB( Buffer.from( "hello" ) ) ],
            [ new DataI( 1 ), new DataB( Buffer.from( "world" ) ) ]
        ]));

        identityTestFor(new DataMap([
            [ new DataB( Buffer.from( "pubKey1", "ascii" ) ), new DataI( 0 ) ],
            [ new DataB( Buffer.from( "pubKey2", "ascii" ) ), new DataI( 42 ) ],
            [ new DataB( Buffer.from( "pubKey3", "ascii" ) ), new DataI( 69 ) ],
            [ new DataB( Buffer.from( "pubKey4", "ascii" ) ), new DataI( 420 ) ],
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