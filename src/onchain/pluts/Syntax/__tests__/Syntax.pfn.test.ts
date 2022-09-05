import { pfn, plam } from ".."
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst"
import { plessEqInt } from "../../Prelude/Builtins"
import PBool from "../../PTypes/PBool"
import PLam from "../../PTypes/PFn/PLam"
import PInt from "../../PTypes/PInt"
import PUnit from "../../PTypes/PUnit"
import Term from "../../Term"
import Type from "../../Term/Type"


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


    test("", () => {

        const pfnBinOp = pfn([ Type.Int, Type.Int ], Type.Bool )(
            ( a: Term<PInt>, b: Term<PInt> ) => plessEqInt.$( b ).$( a )
        )
        const plamBinOp = plam( Type.Int, Type.Lambda( Type.Int, Type.Bool ) )(
            ( a: Term<PInt> ): Term<PLam<PInt, PBool>> =>
                plam( Type.Int, Type.Bool )(
                    ( b: Term<PInt> ): Term<PBool> => plessEqInt.$( b ).$( a )
                )
        );

        expect(
            pfnBinOp.toUPLC( 0 )
        ).toEqual(
            plamBinOp.toUPLC( 0 )
        );

    })

})