import { PScriptContext, V2 } from "../../../API/V2";
import { pmatch } from "../../../PTypes/PStruct/pmatch";
import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { bs, int } from "../../../type_system/types";
import { perror } from "../../perror";
import { pfn } from "../../pfn";
import { pInt } from "../../std";
import { plet } from "../index";
import { _old_plet } from "../old";

describe("plet dependecies", () => {

    describe("structs", () => {

        const MyStruct = pstruct({
            New: {
                hello: int,
                there: bs
            }
        });

        test("dot notation", () => {

            const term = pfn([
                MyStruct.type
            ],  int)
            ( my => {

                const two = plet( pInt( 2 ) );

                return my.hello.add( two ).mult( two )
            });

            term.toIR();
        });

        test("(deprecated) extract", () => {

            const term = pfn([
                MyStruct.type
            ],  int)
            ( my => {

                return my.extract("hello").in(({ hello }) => {

                    const two = plet( pInt( 2 ) );

                    return hello.add( two ).mult( two )
                });

            });

            term.toIR();
        });

        test("(deprecated) extract with plet( ... ).in", () => {

            const term = pfn([
                MyStruct.type
            ],  int)
            ( my => {

                return my.extract("hello").in(({ hello }) => {

                    return plet( pInt( 2 ) ).in( two => 
                        hello.add( two ).mult( two )
                    );
                })
            });

            term.toIR()

        });

    });

    test("plet().in ownCurrencySymbol" , () => {

        const doubleOwnCurrSym = pfn([
            PScriptContext.type
        ],  bs)
        (( ctx ) =>
            
            plet( ctx.purpose ).in( ( purpose ) =>
        
                plet(
                    pmatch( purpose )
                    .onMinting( mint => mint.currencySym )
                    ._( _ => perror( bs ) )
                ).in( ownCurrSym => ownCurrSym.concat( ownCurrSym ) )
            
            )
        );

        doubleOwnCurrSym.toIR()

    });

    test("(deprecated) extract().in ownCurrencySymbol" , () => {

        const doubleOwnCurrSym = pfn([
            PScriptContext.type
        ],  bs)
        (( ctx ) =>
            
            ctx.extract("purpose").in( ({ purpose }) =>
        
                plet(
                    pmatch( purpose )
                    .onMinting( mint => mint.currencySym )
                    ._( _ => perror( bs ) )
                ).in( ownCurrSym => ownCurrSym.concat( ownCurrSym ) )
            
            )
        );

        doubleOwnCurrSym.toIR()

    });

    test("(latest) ownCurrencySymbol" , () => {

        const doubleOwnCurrSym = pfn([
            PScriptContext.type
        ],  bs)
        (( { purpose } ) => {

            const ownCurrSym = plet(
                pmatch( purpose )
                .onMinting( mint => mint.currencySym )
                ._( _ => perror( bs ) )
            );

            return ownCurrSym.concat( ownCurrSym );
        });

        doubleOwnCurrSym.toIR()

    });

})