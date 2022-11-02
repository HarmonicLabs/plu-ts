import { pfindList, pmap } from ".."
import BigIntUtils from "../../../../../utils/BigIntUtils"
import evalScript from "../../../../CEK"
import { showUPLC } from "../../../../UPLC/UPLCTerm"
import PScriptContext from "../../../API/V1/ScriptContext"
import PBool, { pBool } from "../../../PTypes/PBool"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import pmatch from "../../../PTypes/PStruct/pmatch"
import PUnit, { pmakeUnit } from "../../../PTypes/PUnit"
import { makeValidator } from "../../../Script"
import compile, { PlutusScriptVersion, scriptToJsonFormat } from "../../../Script/compile"
import { perror, pfn, punsafeConvertType } from "../../../Syntax"
import Term from "../../../Term"
import Type, { bool, data, int, list, unit } from "../../../Term/Type"
import { peqInt, pif, punIData, punListData } from "../../Builtins"
import PMaybe from "../../PMaybe"

describe("pfindList", () => {

    test("finds '1' in [1,2,3,4,5]", () => {

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 1 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 1 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    });

    test("finds '2' in [1,2,3,4,5]", () => {

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 2 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 2 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    })

    test("finds '5' in [1,2,3,4,5]", () => {

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 5 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 5 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    });

    test.only("find 42 contract", () => {

        const contract = pfn([
            data,
            list( int ),
            PScriptContext.type
        ],  bool)
        (( _datum, nums, _ctx ) => 
            pmatch( 
                pfindList( int )
                .$( peqInt.$( pInt( 42 ) ) )
                .$( nums )
            )
            .onJust( _ => pBool( true  ) )
            .onNothing( _ => pBool( false ) ) as Term<PBool>
        )

        const unitData = PUnit.toDataTerm.$( pmakeUnit() );

        const validatorContract = pfn([
            data,
            data,
            data
        ],  unit)
        (( datum, redeemer, ctx ) =>
            pif(unit).$(
                contract
                .$( datum )
                .$(
                    pmap( data, int )
                    .$( punIData )
                    .$( punListData( Type.Data.Int ).$( redeemer ) )
                )
                .$( punsafeConvertType( ctx, PScriptContext.type ) )
            )
            .then( pmakeUnit() )
            .else( perror( unit ) )
        );

        console.log( showUPLC(
            validatorContract.toUPLC(0)
        ) );

        const compiled = compile(
            validatorContract
        );

        const compiledAsBI = BigIntUtils.fromBuffer(
            compiled
        );

        console.log( compiledAsBI.toString(2) );

        console.log(
            JSON.stringify(
                scriptToJsonFormat(
                    compiled,
                    PlutusScriptVersion.V1
                )
            )
        );

    })
});






/*

        expect(
            evalScript(
                contract
                .$( unitData )
                .$( pList( int )([ 1,2,3 ].map( pInt )))
                .$( punsafeConvertType( unitData, PScriptContext.type ) )
            )
        ).toEqual(
            evalScript(
                pBool( false )
            )
        )

        expect(
            evalScript(
                contract
                .$( unitData )
                .$( pList( int )([ 42, 1,2,3 ].map( pInt )))
                .$( punsafeConvertType( unitData, PScriptContext.type ) )
            )
        ).toEqual(
            evalScript(
                pBool( true )
            )
        )

        expect(
            evalScript(
                contract
                .$( unitData )
                .$( pList( int )([ 1,2,3,42 ].map( pInt )) )
                .$( punsafeConvertType( unitData, PScriptContext.type ) )
            )
        ).toEqual(
            evalScript(
                pBool( true )
            )
        )
*/