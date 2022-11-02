import { papp, pfn, precursive } from ".."
import evalScript from "../../../CEK"
import { showUPLC } from "../../../UPLC/UPLCTerm"
import Application from "../../../UPLC/UPLCTerms/Application"
import ErrorUPLC from "../../../UPLC/UPLCTerms/ErrorUPLC"
import HoistedUPLC from "../../../UPLC/UPLCTerms/HoistedUPLC"
import Lambda from "../../../UPLC/UPLCTerms/Lambda"
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst"
import UPLCVar from "../../../UPLC/UPLCTerms/UPLCVar"
import { pif } from "../../stdlib/Builtins"
import TermInt, { addPIntMethods } from "../../stdlib/UtilityTerms/TermInt"
import PType from "../../PType"
import PLam from "../../PTypes/PFn/PLam"
import PInt, { pInt } from "../../PTypes/PInt"
import Term from "../../Term"
import Type, { PrimType } from "../../Term/Type"


describe("precursive", () => {

    const a = Type.Var("a");
    const b = Type.Var("b");

    const innerZ = new Lambda( // toMakeRecursive
        new Application(
            new UPLCVar( 1 ), // Z
            new Lambda( // value
                new Application(
                    new Application(
                        new UPLCVar( 1 ), // toMakeRecursive
                        new UPLCVar( 1 )  // toMakeRecursive
                    ),
                    new UPLCVar( 0 ) // value
                )
            )
        )
    );

    /** 
     * @hoisted
    **/
    const Z = new Term<
            PLam<
                PLam<
                    PLam<PType,PType>,
                    PLam<PType,PType>
                >,
            PLam<PType,PType>
            >
        >(
            Type.Lambda(
                Type.Lambda( Type.Lambda( a, b ), Type.Lambda( a, b ) ),
                Type.Lambda( a, b ),
            ),
            _dbn => new HoistedUPLC(
                new Lambda( // Z
                    new Application(
                        innerZ,
                        innerZ
                    )
                )
            )
        );

    test("evalScript(Z) is fine", () => {

        let evaluedZ;

        expect( () => {
            evaluedZ = evalScript( Z.toUPLC(0) );
        }).not.toThrow()

        expect( evaluedZ ).not.toEqual( undefined );
        expect( evaluedZ ).not.toEqual( new ErrorUPLC );

    })

    test("pfactorial", () => {

        const pfactorial = precursive(
            pfn(
                [
                    Type.Lambda( Type.Int, Type.Int ),
                    Type.Int
                ],
                Type.Int
            )( ( self , n ) => {

                    const _n = addPIntMethods( n );
                    
                    return pif( Type.Int ).$( _n.ltEq( pInt( 1 ) ) )
                        .then( pInt( 1 ) )
                        .else(
                            _n.mult(
                                papp(
                                    self,
                                    _n.sub( pInt( 1 ) )
                                )
                            )
                        );
                }
            )
        );

        function jsFactorial( n: number ): number
        {
            return n <= 1 ? 1 : n * jsFactorial( n - 1 )
        }

        function jsFactorialBig( n: bigint ): bigint
        {
            return n <= 1 ? BigInt(1) : n * jsFactorialBig( n - BigInt(1) )
        }

        function testFact( n: number ): void
        {
            const res = jsFactorial( n );
            // console.log( `${n}! === ${res}` );
            expect(
                evalScript(
                    pfactorial.$( pInt( n ) )
                    .toUPLC( 0 )
                )
            ).toEqual(
                UPLCConst.int( res )
            )
        };
        
        for(let i = 0; i < 10; i++)
        {
            testFact( i );
        }

        function testFactBig( n: bigint ): void
        {
            const res = jsFactorialBig( n );
            
            // console.log( `${n}! === ${res}` );

            expect(
                evalScript(
                    pfactorial.$( pInt( n ) )
                    .toUPLC( 0 )
                )
            ).toEqual(
                UPLCConst.int( res )
            );

        };
        
        for(let i = BigInt(20); i < 25; i++)
        {
            testFactBig( i );
        }

    })

})