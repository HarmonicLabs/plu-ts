import { DataI } from "../../../../../../types/Data/DataI";
import { Machine } from "../../../../../CEK";
import { showUPLC } from "../../../../../UPLC/UPLCTerm";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { PData, PInt, pmatch } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { PMaybe, pBool, pByteString, pData, pDataI, pInt, pPair, pdelay, pfn, phoist, pif, precursiveList, toData } from "../../../../lib";
import { pList } from "../../../../lib/std/list/const";
import { termTypeToString } from "../../../../type_system";
import { asData, bs, fn, int, list } from "../../../../type_system/types";
import { PCurrencySymbol } from "../PCurrencySymbol";
import { PTokenName } from "../PTokenName";
import { PAssetsEntryT, PValue, PValueEntryT } from "../PValue";

const currSym = PCurrencySymbol.from( pByteString("ff".repeat(28)) );
const tn = PTokenName.from( pByteString("") );

const oneEntryValue = PValue.from( 
    pList( PValueEntryT )([
        pPair( PValueEntryT[1], PValueEntryT[2] )
        (
            currSym,
            pList( PAssetsEntryT )([
                pPair( PAssetsEntryT[1], PAssetsEntryT[2] )
                ( 
                    tn,
                    pInt(1_000_000)
                )
            ])
        )
    ])
);


describe("Machine.evalSimple( PValue )", () => {

    test("empty value constructed correctly", () => {
        expect(
            Machine.evalSimple(
                PValue.from( pList( PValueEntryT )([]) as any )
            ) instanceof UPLCConst
        ).toBe( true )
        
    });

    test("one entry value", () => {
        expect(
            Machine.evalSimple( oneEntryValue ) instanceof UPLCConst
        ).toBe( true )
    });
    
    test("one entry to data", () => {

        const { result } = Machine.eval(
            toData( PValue.type )( oneEntryValue )
        );

        expect(
            result instanceof UPLCConst
        ).toBe( true )

    });

    test("value in maybe", () => {

        const { result } = Machine.eval(
            PMaybe( PValue.type ).Just({ val: oneEntryValue })
        );
        
        expect(
            result instanceof UPLCConst
        ).toBe( true )

    })

});
const pvalueOf = phoist(
    pfn([
        PValue.type,
        bs,
        bs
    ],  asData( int ))
    (( value, currSym, tokenName ) =>
        pmatch(
            value.find( entry => 
                entry.fst.eq( currSym )
            )
        )
        .onJust( _ => _.extract("val").in( ({ val: policyEntry }) => 
            
            pmatch(
                policyEntry.snd.find( assetEntry => 
                    assetEntry.fst.eq( tokenName )
                )
            )
            .onJust( _ => _.extract("val").in(({ val: entry }) =>
                entry.snd 
            ))
            .onNothing( _ => pDataI( 0 ) as any )
        ))
        .onNothing( _ => pDataI( 0 ) as any )
    )
);

const pvalueOfBetter = phoist(
    pfn([
        PValue.type,
        PCurrencySymbol.type,
        PTokenName.type
    ],  int)
    (( value, currSym, tokenName ) =>
        precursiveList( int, PValueEntryT )
        .$( _self => pdelay( pInt(0) ) )
        .$( 
            pfn([
                fn([ list(PValueEntryT) ], int ),
                PValueEntryT,
                list( PValueEntryT )
            ],  int)
            ((self, head, tail ) =>
            pif( int ).$( head.fst.eq( currSym ) )
            .then(

                precursiveList( int, PAssetsEntryT )
                .$( _self => pdelay( pInt(0) ) )
                .$(
                    pfn([
                        fn([ list(PAssetsEntryT) ], int ),
                        PAssetsEntryT,
                        list( PAssetsEntryT )
                    ],  int)
                    (
                        (self, head, tail) =>
                        pif( int ).$( head.fst.eq( tokenName ) )
                        .then( head.snd )
                        .else( self.$( tail ) as any )
                    )
                )
                .$( head.snd )
            )
            .else( self.$( tail ) as any ))
        )
        .$( value )
    )
);

describe("pvalueOf", () => {

    test("non exsistent coin", () => {

        const expected = Machine.evalSimple( pDataI(0) );
        const { result: received, budgetSpent: exBudget } = Machine.eval( pvalueOf.$( oneEntryValue ).$("").$("") );
        const _expected = Machine.evalSimple( pInt(0) );
        const { result: _received, budgetSpent } = Machine.eval( pvalueOfBetter.$( oneEntryValue ).$("" as any).$("" as any) );

        expect(
            received
        ).toEqual(
            expected
        );

    });

    test("policy present but not token", () => {

        const expected = Machine.evalSimple( pDataI(0) );
        const received = Machine.evalSimple( pvalueOf.$( oneEntryValue ).$( currSym as any ).$("abc") );

        expect(
            received
        ).toEqual(
            expected
        );

    });

    test("token present", () => {

        const term = pvalueOf.$( oneEntryValue ).$( currSym as any ).$( tn as any );

        const expected = Machine.evalSimple( pDataI( 1_000_000 ) );
        const received = Machine.evalSimple( term );

        expect(
            received
        ).toEqual(
            expected
        );

        expect(
            term.type
        )
        .toEqual( asData( int ) )

        // `asData( int )` threadted as `int`
        expect(
            Machine.evalSimple(
                pInt(1_000_000).eq( term as any )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        );

    });

})