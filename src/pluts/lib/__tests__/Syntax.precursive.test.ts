import { PType } from "../../PType"
import { PLam } from "../../PTypes/PFn/PLam"
import { Term } from "../../Term"
import { papp } from "../papp"
import { pfn } from "../pfn"
import { precursive } from "../precursive"
import { pif } from "../builtins"
import { pInt } from "../std/int/pInt"
import { int, lam, tyVar } from "../../../type_system"
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted"
import { IRFunc } from "../../../IR/IRNodes/IRFunc"
import { IRApp } from "../../../IR/IRNodes/IRApp"
import { IRVar } from "../../../IR/IRNodes/IRVar"
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine"
import { ErrorUPLC, prettyUPLC, showUPLC, UPLCConst } from "@harmoniclabs/uplc"


describe("precursive", () => {

    const a = tyVar("a");
    const b = tyVar("b");

    const innerZ = new IRFunc( 1, // toMakeRecursive
        new IRApp(
            new IRVar( 1 ), // Z
            new IRFunc( 1, // value
                new IRApp(
                    new IRApp(
                        new IRVar( 1 ), // toMakeRecursive
                        new IRVar( 1 )  // toMakeRecursive
                    ),
                    new IRVar( 0 ) // value
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
            lam(
                lam( lam( a, b ), lam( a, b ) ),
                lam( a, b ),
            ) as any,
            _dbn => new IRHoisted(
                new IRFunc( 1, // Z
                    new IRApp(
                        innerZ,
                        innerZ
                    )
                )
            )
        );

    test("Machine.evalSimple(Z) is fine", () => {

        let evaluedZ;

        expect( () => {
            evaluedZ = Machine.evalSimple( Z.toUPLC(0) );
        }).not.toThrow()

        expect( evaluedZ ).not.toEqual( undefined );
        expect( evaluedZ ).not.toEqual( new ErrorUPLC );

    })

    test("pfactorial", () => {

        const pfactorial = precursive(
            pfn(
                [
                    lam( int, int ),
                    int
                ],
                int
            )( ( self , n ) => {

                    return pif( int ).$( n.ltEq( pInt( 1 ) ) )
                        .then( pInt( 1 ) )
                        .else(
                            n.mult(
                                papp(
                                    self,
                                    n.sub( pInt( 1 ) )
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
            const uplc = pfactorial.$( pInt( n ) )
            .toUPLC( 0 );

            // n === 0 && console.log( prettyUPLC( uplc ) );

            expect(
                Machine.evalSimple(
                    uplc
                )
            ).toEqual(
                CEKConst.int( res )
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

            const uplc = pfactorial.$( pInt( n ) ).toUPLC( 0 );
            expect(
                Machine.evalSimple(
                    pfactorial.$( pInt( n ) )
                    .toUPLC( 0 )
                )
            ).toEqual(
                CEKConst.int( res )
            );

        };
        
        for(let i = BigInt(20); i < 25; i++)
        {
            testFactBig( i );
        }

    })

})