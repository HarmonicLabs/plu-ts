import { Application } from "../../../UPLC/UPLCTerms/Application"
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin"
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda"
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst"
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar"
import { PBool } from "../../PTypes/PBool"
import { PInt } from "../../PTypes/PInt"
import { PUnit } from "../../PTypes/PUnit"
import { Term } from "../../Term"
import { Type } from "../../Term/Type/base"
import { plessEqInt } from "../builtins"
import { pfn } from "../pfn"
import { plam } from "../plam"
import { pInt } from "../std/int/pInt"


describe("pfn", () => {

    test("throws on void input function", () => {
        
        expect(
            () => pfn([Type.Unit], Type.Int )(
                () => new Term( Type.Int, _dbn => UPLCConst.int( 2 ) )
            )
        ).toThrow();

    });

    test("single input functions as plam", () => {

        const withPFn = pfn([Type.Unit], Type.Int )(
            ( unit: Term<PUnit> ) => new Term( Type.Int, _dbn => UPLCConst.int( 2 ) )
        );
        const withPLam = plam( Type.Unit, Type.Int )(
            ( unit: Term<PUnit> ) => new Term<PInt>( Type.Int, _dbn => UPLCConst.int( 2 ) )
        );
        
        expect(
            withPFn.toUPLC( 0 )
        ).toEqual(
            withPLam.toUPLC( 0 )
        )

        const termUnit = new Term<PUnit>( Type.Unit, _dbn => UPLCConst.unit );

        expect(
            withPFn.$( termUnit ).toUPLC( 0 )
        ).toEqual(
            withPLam.$( termUnit ).toUPLC( 0 )
        )

    });


    test("binary operation got using 'pfn' is the same as 'plam( x => plam( y => binOp.$( x ).$( y ) ) )' (double 'plam')", () => {

        const pfnBinOp = pfn([ Type.Int, Type.Int ], Type.Bool )(
            ( a: Term<PInt>, b: Term<PInt> ) => plessEqInt.$( b ).$( a )
        )
        const plamBinOp = plam( Type.Int, Type.Lambda( Type.Int, Type.Bool ) )(
            ( a: Term<PInt> ) =>
                plam( Type.Int, Type.Bool )(
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
                    UPLCConst.int( 2 )
                ),
                UPLCConst.int( 3 )
            );

        
    })

})