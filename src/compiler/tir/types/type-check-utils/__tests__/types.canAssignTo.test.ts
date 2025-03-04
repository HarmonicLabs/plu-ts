import { TirBytesT, TirDataT, TirListT, TirOptT, TirStringT } from "../../TirNativeType";
import { TirType } from "../../TirType";
import { CanAssign, getCanAssign } from "../canAssignTo";
import { address_t, bool_t, bytes_t, certificate_t, constitutionInfo_t, credential_t, data_t, delegatee_t, extendedInteger_t, govAction_t, hash28_t, hash32_t, int_t, interval_t, intervalBoundary_t, outputDatum_t, policyId_t, proposalProcedure_t, protocolVersion_t, pubKeyHash_t, rational_t, scriptContext_t, scriptHash_t, scriptInfo_t, scriptPurpose_t, stakeCredential_t, string_t, tokenName_t, tx_t, txHash_t, txIn_t, txOut_t, txOutRef_t, value_t, void_t, vote_t, voter_t } from "../../../../AstCompiler/scope/stdScope/stdScope";
import { TirAliasType } from "../../TirAliasType";
import { canCastToData } from "../canCastTo";

const stdTypes = [
    void_t,
    bool_t,
    int_t,
    bytes_t,
    string_t,
    data_t,
    hash32_t,
    hash28_t,
    policyId_t,
    tokenName_t,
    pubKeyHash_t,
    scriptHash_t,
    txHash_t,
    txOutRef_t,
    credential_t,
    rational_t,
    protocolVersion_t,
    constitutionInfo_t,
    govAction_t,
    proposalProcedure_t,
    voter_t,
    scriptPurpose_t,
    scriptInfo_t,
    stakeCredential_t,
    address_t,
    value_t,
    outputDatum_t,
    txOut_t,
    txIn_t,
    extendedInteger_t,
    intervalBoundary_t,
    interval_t,
    vote_t,
    delegatee_t,
    certificate_t,
    tx_t,
    scriptContext_t,
];

const aliasedStd = stdTypes.map( t => 
    new TirAliasType(
        "Aliased" + t.toString(),
        t.clone(),
        []
    )
);
const optStd = stdTypes.map( t => new TirOptT( t.clone() ) );
const lstStd = stdTypes.map( t => new TirListT( t.clone() ) );
const lstOptStd = optStd.map( t => new TirListT( t.clone() ) );
const optLstStd = lstStd.map( t => new TirOptT( t.clone() ) );

const alias_of_bytes = stdTypes.filter( t =>
    t instanceof TirBytesT
    || (()=>{
        if(!(t instanceof TirAliasType)) return false;
        while(t instanceof TirAliasType) {
            t = t.aliased;
        }
        return t instanceof TirBytesT;
    })()
)

const allStdVariants = 
    stdTypes
    .concat( aliasedStd )
    .concat( optStd )
    .concat( lstStd )
    .concat( lstOptStd )
    .concat( optLstStd )
    ;

const noAliasStd = stdTypes.filter( t => !(t instanceof TirAliasType) );

describe("getCanAssign", () => {

    function testAssign(
        a: TirType,
        b: TirType,
        expected: CanAssign
    ) {
        const aStr = a.toString();
        const bStr = b.toString();
        test(`getCanAssign( ${aStr}, ${bStr} )`, () => {
            const result = getCanAssign(
                a,
                b,
            );
            // result !== expected && console.log({
            //     result: CanAssign[result],
            //     expected: CanAssign[expected],
            //     a,
            //     b
            // });
            const resultStr = `${aStr} => ${bStr} : ` + CanAssign[result];
            const expectedStr = `${aStr} => ${bStr} : ` + CanAssign[expected];
            expect( resultStr ).toBe( expectedStr );
        });
    }

    //*
    describe("test same types", () => {
        for( const type of allStdVariants ) {
            testAssign( type, type.clone(), CanAssign.Yes );
        }
    })
    //*/

    //*
    describe("alias_of_bytes", () => {
        for( const a of alias_of_bytes ) {
            for( const b of alias_of_bytes ) {
                testAssign( a, b, CanAssign.Yes );
            }
        }
    })
    //*/
    
    //*
    describe("assing to optional", () => {
        for( let i = 0; i < stdTypes.length; i++ ) {
            if( stdTypes[i] instanceof TirDataT )
                testAssign( stdTypes[i], optStd[i], CanAssign.RequiresExplicitCast );
            else testAssign( stdTypes[i], optStd[i], CanAssign.LiftToOptional );
        }
    })
    //*/

    // testAssign( vote_t, data_t, CanAssign.RequiresExplicitCast );

    // test for CanAssign.No
    //*
    describe("test incompatible types", () => {
        for( let i = 0; i < noAliasStd.length; i++ ) {
            for( let j = 0; j < noAliasStd.length; j++ ) {

                if( i === j ) continue;

                if( // happen to have same shape, different name
                    (getCanAssign(noAliasStd[i], rational_t) && getCanAssign(noAliasStd[j], protocolVersion_t))
                    || (getCanAssign(noAliasStd[i], protocolVersion_t) && getCanAssign(noAliasStd[j], rational_t))
                ) testAssign( noAliasStd[i], noAliasStd[j], CanAssign.RequiresExplicitCast );

                else if(
                    (noAliasStd[i] instanceof TirDataT && canCastToData( noAliasStd[j] ))
                    || (noAliasStd[j] instanceof TirDataT && canCastToData( noAliasStd[i] ))
                    || (noAliasStd[i] instanceof TirBytesT && noAliasStd[j] instanceof TirStringT)
                    || (noAliasStd[i] instanceof TirStringT && noAliasStd[j] instanceof TirBytesT)
                )
                    testAssign( noAliasStd[i], noAliasStd[j], CanAssign.RequiresExplicitCast );

                else
                    testAssign( noAliasStd[i], noAliasStd[j], CanAssign.No );
            }
        }
    });
    //*/

    testAssign(
        new TirListT( new TirOptT( tx_t.clone() ) ),
        new TirOptT( void_t.clone() ),
        CanAssign.No
    );

    /*
    const results: { [x: number]: [ TirType, TirType ][] } = {
        [CanAssign.LeftArgIsNotConcrete]: [],
        [CanAssign.No]: [],
        [CanAssign.Yes]: [],
        [CanAssign.RequiresExplicitCast]: [],
        [CanAssign.LiftToOptional]: [],
    };

    for( let i = 0; i < allStdVariants.length; i++ ) {
        for( let j = 0; j < allStdVariants.length; j++ ) {
            const a = allStdVariants[i];
            const b = allStdVariants[j];
            const result = getCanAssign( a, b );
            results[result].push( [ a, b ] );
        }
    }

    const lengts = {};
    for( const key in results ) {
        lengts[CanAssign[key]] = results[key].length;
    }

    console.log( lengts );

    for( const [a, b] of results[CanAssign.LiftToOptional] ) {
        console.log(`getCanAssign( ${a.toString()}, ${b.toString()} )`);
    }
    //*/

});