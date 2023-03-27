import { list, pstruct, unit } from "../.."
import { compileIRToUPLC } from "../../../IR/toUPLC/compileIRToUPLC"
import { prettyIRJsonStr } from "../../../IR/utils/showIR"
import { prettyUPLC } from "../../../UPLC/UPLCTerm"
import { PScriptContext } from "../../API"
import { pBool, pfn } from "../../lib"
import { bool, bs, data, int } from "../../type_system"
import { compile } from "../compile"
import { makeRedeemerValidator } from "../makeScript"

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

        const WrappedList = pstruct({
            WrappedList: {
                list: list( int )
            }
        });

        const ComplexStuff = pstruct({
            Stuff: {
                a: WrappedList.type,
                b: WrappedList.type
            }
        });

        const sumComplexStuff = pfn([
            data,
            ComplexStuff.type
        ],  bool)
        ( (_, stuff) => stuff.a.list.length.eq( stuff.b.list.length ));

        const ir = sumComplexStuff.toIR();
        const uplc = compileIRToUPLC( ir );
        
        // console.log( prettyIRJsonStr( ir ));
        // console.log( prettyUPLC( uplc ));

        compile( sumComplexStuff )

    });

    test("two tx fields used", () => {

        const contract = pfn([
            int,
            PScriptContext.type
        ],  bool)
        (( rdmr, ctx ) => {

            return ctx.tx.inputs.length.eq( ctx.tx.signatories.length )
        });

        // console.log( prettyIRJsonStr( contract.toIR() ) );

        compile( makeRedeemerValidator( contract ) );
    })
})