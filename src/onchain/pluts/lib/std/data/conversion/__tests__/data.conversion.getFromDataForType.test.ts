import { Machine } from "../../../../../../CEK";
import { showUPLC } from "../../../../../../UPLC/UPLCTerm";
import { UPLCConst } from "../../../../../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../../../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { PData, pmatch } from "../../../../../PTypes";
import { pair, bs, int, list, Term, data, typeExtends, dynPair } from "../../../../../Term";
import { perror } from "../../../../perror";
import { PMaybe } from "../../../PMaybe";
import { pByteString } from "../../../bs";
import { pInt } from "../../../int";
import { pList } from "../../../list";
import { pPair } from "../../../pair";
import { getFromDataForType } from "../getFromDataTermForType";
import { getToDataForType } from "../getToDataTermForType";


describe("that damn pair as a field", () => {

    const pairInMaybe = PMaybe( pair( bs, int ) ).Just({ val: pPair( bs, int )( pByteString("caffee"), pInt(42) )});
    const pairInMaybeUPLC = pairInMaybe.toUPLC(0);
    
    test("pair in maybe", () => {

        expect( pairInMaybeUPLC instanceof UPLCConst ).toBe( true );
        expect( pairInMaybeUPLC instanceof UPLCConst && pairInMaybeUPLC.type ).toEqual( constT.data );

    });

    test("just extract the field", () => {

        const val = Machine.evalSimple(
            pmatch( pairInMaybe )
            .onJust( _ => _.extract("val").in( ({ val }) => val ))
            .onNothing( _ => perror( pair( bs, int ) ) )
        );

        expect( val instanceof UPLCConst ).toBe( true );
        expect( val instanceof UPLCConst && val.type ).toEqual( constT.pairOf( constT.data, constT.data ) );

    });

    test("get snd", () => {

        const val = Machine.evalSimple(
            pmatch( pairInMaybe )
            .onJust( _ => _.extract("val").in( ({ val }) => val.snd ))
            .onNothing( _ => perror( int ) )
        );

        expect( val instanceof UPLCConst ).toBe( true );
        expect( val instanceof UPLCConst && val.type ).toEqual( constT.int );
        expect( (val as any).value.asBigInt ).toEqual( 42n );

    });

    const assetEntryT = dynPair( bs, int );
    const policyEntryT = dynPair( bs, list( assetEntryT ) );

    const valueEntryLike = pPair( bs, list( assetEntryT ) )
    (
        pByteString("dead"),
        pList( dynPair( bs, int ) )([
            pPair( bs, int )
            ( pByteString("beef"), pInt(69) )
        ])
    );

    const valueEntryAsData = new Term<PData>(
        data,
        _ => getToDataForType( valueEntryLike.type as any )( valueEntryLike ).toUPLC(0) 
    )

    test.only("getFromData( valueEntryAsData )", () => {

        const val = getFromDataForType( valueEntryLike.type as any )( valueEntryAsData );
        const valUPLC = val.toUPLC(0);

        console.log( val );
        console.log(
            showUPLC(
                valUPLC
            )
        )

        expect( typeExtends( val.type, dynPair( bs, assetEntryT ) ) ).toBe( true );
        expect( valUPLC instanceof UPLCConst ).toBe( true )
        
    })
    
})