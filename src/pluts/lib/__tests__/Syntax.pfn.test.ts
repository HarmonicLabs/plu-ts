import { Application, Lambda, Builtin, UPLCVar } from "@harmoniclabs/uplc"
import { IRConst } from "../../../IR/IRNodes/IRConst"
import { PBool } from "../../PTypes/PBool"
import { PInt } from "../../PTypes/PInt"
import { PUnit } from "../../PTypes/PUnit"
import { Term } from "../../Term"
import { bool, int, lam, unit } from "../../../type_system"
import { plessEqInt } from "../builtins"
import { pfn } from "../pfn"
import { plam } from "../plam"
import { pInt } from "../std/int/pInt"

describe("pfn", () => {

    test("throws on void input function", () => {
        
        expect(
            () => pfn([ unit ], int )(
                () => new Term( int, _dbn => IRConst.int( 2 ) )
            )
        ).toThrow();

    });

    test("single input functions as plam", () => {

        const withPFn = pfn([unit], int )(
            ( unit: Term<PUnit> ) => new Term( int, _dbn => IRConst.int( 2 ) )
        );
        const withPLam = plam( unit, int )(
            ( unit: Term<PUnit> ) => new Term<PInt>( int, _dbn => IRConst.int( 2 ) )
        );
        
        expect(
            withPFn.toUPLC( 0 )
        ).toEqual(
            withPLam.toUPLC( 0 )
        )

        const termUnit = new Term<PUnit>( unit, _dbn => IRConst.unit );

        expect(
            withPFn.$( termUnit ).toUPLC( 0 )
        ).toEqual(
            withPLam.$( termUnit ).toUPLC( 0 )
        )

    });


    test("binary operation got using 'pfn' is the same as 'plam( x => plam( y => binOp.$( x ).$( y ) ) )' (double 'plam')", () => {

        const pfnBinOp = pfn([ int, int ], bool )(
            ( a: Term<PInt>, b: Term<PInt> ) => plessEqInt.$( b ).$( a )
        )
        const plamBinOp = plam( int, lam( int, bool ) )(
            ( a: Term<PInt> ) =>
                plam( int, bool )(
                    ( b: Term<PInt> ): Term<PBool> => plessEqInt.$( b ).$( a )
                )
        );

        expect(
            pfnBinOp.toUPLC( 0 )
        ).toEqual(
            plamBinOp.toUPLC( 0 )
        );

        const pfnUPLC = pfnBinOp.$( pInt( 2 ) ).$( pInt( 3 ) ).toUPLC( 0 );
        const plamUPLC = plamBinOp.$( pInt( 2 ) ).$( pInt( 3 ) ).toUPLC( 0 );
        const targetUPLC =
            new Application(
                new Application(
                    new Lambda(
                        new Lambda(
                            new Application(
                                new Application(
                                    Builtin.lessThanEqualInteger,
                                    new UPLCVar( 0 )
                                ),
                                new UPLCVar( 1 )
                            )
                        )
                    ),
                    IRConst.int( 2 )
                ),
                IRConst.int( 3 )
            );

        
    })

})