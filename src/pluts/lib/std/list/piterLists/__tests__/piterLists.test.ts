import { Machine } from "@harmoniclabs/plutus-machine";
import { piterLists } from "..";
import { bool, int } from "../../../../../../type_system/types";
import { pBool } from "../../../bool";
import { pList } from "../../const";
import { pInt } from "../../../int";
import { pisEmpty } from "../../../../builtins";

describe("piterLists", () => {

    test("only match", () => {

        const pBothNonEnpty = piterLists( int, int, bool )
        .$((self, restSnd) => pBool( false ))
        .$((self, restFst) => pBool( false ))
        .$((self, fst, restFst, snd, restSnd) => pBool( true ))
        
        expect(
            Machine.evalSimple(
                pBothNonEnpty
                .$( pList( int )([]) )
                .$( pList( int )([]) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                pBothNonEnpty
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([]) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                pBothNonEnpty
                .$( pList( int )([]) )
                .$( pList( int )([ 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                pBothNonEnpty
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([ 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

    })

    test.only("peqListInt", () => {

        const peqListInt = piterLists( int, int, bool )
        .$((self, restSnd) => pisEmpty.$( restSnd ) )
        .$((self, restFst) => pisEmpty.$( restFst ) )
        .$((self, fst, restFst, snd, restSnd) =>
            fst.eq( snd )
            .and( 
                self.$( restFst ).$( restSnd ) 
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([]) )
                .$( pList( int )([]) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([]) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([]) )
                .$( pList( int )([ 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );
        
        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 2 ].map( pInt )) )
                .$( pList( int )([ 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([ 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([ 1, 2 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1 ].map( pInt )) )
                .$( pList( int )([ 2 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1, 2 ].map( pInt )) )
                .$( pList( int )([ 1, 2 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

        expect(
            Machine.evalSimple(
                peqListInt
                .$( pList( int )([ 1, 2 ].map( pInt )) )
                .$( pList( int )([ 1, 1 ].map( pInt )) )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( false )
            )
        );

    })

})