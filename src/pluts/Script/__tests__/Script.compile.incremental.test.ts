import { Machine } from "@harmoniclabs/plutus-machine";
import { pstruct, pfn } from "../../../pluts";
import { pBool } from "../../lib";
import { bool, data, int, list, struct } from "../../../type_system"
import { compile } from "../compile"
import { compileIRToUPLC } from "../../../IR/toUPLC/compileIRToUPLC";

describe("compile", () => {

    test("stuff", () => {

        const Stuff = pstruct({
            Stuff: {
                a: int,
                b: int
            }
        });

        const sumStuff = pfn([
            Stuff.type
        ],  int)
        ( stuff => stuff.a.add( stuff.b ));

        const ir = sumStuff.toIR();
        const uplc = compileIRToUPLC( ir );
        
        // console.log( prettyIRJsonStr( ir ));
        // console.log( prettyUPLC( uplc ));

    });

    test("complex stuff", () => {

        const WrappedInt = pstruct({
            WrappedInt: {
                int: int
            }
        });

        const ComplexStuff = pstruct({
            Stuff: {
                a: WrappedInt.type,
                b: WrappedInt.type
            }
        });

        const sumComplexStuff = pfn([
            ComplexStuff.type
        ],  int)
        ( stuff => stuff.a.int.add( stuff.b.int ));

        const ir = sumComplexStuff.toIR();
        const uplc = compileIRToUPLC( ir );
        
        // console.log( prettyIRJsonStr( ir ));
        // console.log( prettyUPLC( uplc ));

    });

    test("complex list stuff", () => {

        const TwoWrappedList = pstruct({
            TwoWrappedList: {
                fst: list( data ),
                snd: list( data )
            }
        });

        const ComplexStuff = pstruct({
            Stuff: {
                a: TwoWrappedList.type
            }
        });

        const sumComplexStuff = pfn([
            data,
            ComplexStuff.type
        ],  bool)
        ( (_, stuff) => stuff.a.fst.length.eq( stuff.a.snd.length ));

        const ir = sumComplexStuff.toIR();
        const uplc = compileIRToUPLC( ir );
        
        // console.log( prettyIRJsonStr( ir ));
        // console.log( prettyUPLC( uplc ));

        compile( sumComplexStuff )

    });

    test("two tx fields used", () => {

        //const contract = pfn([
        //    int,
        //    V2.PScriptContext.type
        //],  bool)
        //(( rdmr, ctx ) => {
//
        //    return ctx.tx.inputs.length.eq( ctx.tx.refInputs.length )
        //});

        // const ir = contract.toIR();
        // const uplc = compileIRToUPLC( ir );

        const JustACtor = pstruct({
            Ctor: {}
        })

        const TwoWrappedList = pstruct({
            TwoWrappedList: {
                fst: struct({ Ctor: {} }),
                snd: struct({ Ctor: {} })
            }
        });

        const ComplexStuff = pstruct({
            Stuff: {
                a: TwoWrappedList.type
            }
        });

        const term = pfn([
            ComplexStuff.type
        ],  bool)
        ( (stuff) => stuff.a.fst.eq( stuff.a.snd ));

        expect(
            Machine.evalSimple(
                term.$(
                    ComplexStuff.Stuff({
                        a: TwoWrappedList.TwoWrappedList({
                            fst: JustACtor.Ctor({}) as any,
                            snd: JustACtor.Ctor({}) as any
                        }) as any
                    })
                )
            )
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        )

    })
})