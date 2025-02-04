import { PScriptContext } from "../../../API/V2";
import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { bs, int } from "../../../../type_system/types";
import { perror } from "../../perror";
import { pfn } from "../../pfn";
import { pInt } from "../../std";

import { plet } from "../index";
import { _old_plet } from "../old";
import { plam } from "../../plam";
import { palias } from "../../../PTypes/PAlias/palias";
import { PValue } from "../../../API/V1/Value/PValue";
import { pmatch } from "../../pmatch";

describe.skip("plet dependecies", () => {

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

    });

    test("plet().in ownCurrencySymbol" , () => {

        const doubleOwnCurrSym = pfn([
            V2.PScriptContext.type
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

    test("(latest) ownCurrencySymbol" , () => {

        const doubleOwnCurrSym = pfn([
            V2.PScriptContext.type
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

    describe("plet(...).in( stuff => plet(...).in( thing => ... )", () => {

        test("dummy", () => {

            const dummy = plet( pInt( 42 ) ).in( stuff =>
                plet( pInt( 69 ) ).in( thing => thing.add( stuff ) ) 
            );

            const uplc = dummy.toUPLC();

        });

        test("dummy in function", () => {

            const dummy = plam( int, int )
            ( n => 
                plet( pInt( 42 ) ).in( stuff =>
                    plet( pInt( 69 ) ).in( thing => thing.add( stuff ).add( n ) ) 
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("dummy struct", () => {
            
            const Thing =  pstruct({
                Thing: {
                    thing: int
                }
            });

            const dummy = plam( Thing.type, int )
            ( n => 
                plet( pInt( 42 ) ).in( stuff =>
                    plet( pInt( 69 ) ).in( thing => thing.add( stuff ).add( n.thing ) ) 
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("dummy struct w/ methods", () => {
            
            const Thing =  pstruct({
                Thing: {
                    thing: int
                }
            },
            self_t => {
                return {
                    num: plam( self_t, int )
                    ( self => self.thing )
                }
            });

            const dummy = plam( Thing.type, int )
            ( n => 
                plet( pInt( 42 ) ).in( stuff =>
                    plet( pInt( 69 ) ).in( thing => thing.add( stuff ).add( n.thing ) ) 
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("dummy val", () => {

            const dummy = plam( PValue.type, int )
            ( val => 
                plet( val.head.snd ).in( thing => 
                    plet( val.head.fst.at(0) ).in( stuff =>
                        stuff.add( 3 ) 
                    ) 
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("plet( struct_with_methods ).in( thing => ... )", () => {

            const Thing =  pstruct({
                Thing: {
                    thing: int
                }
            },
            self_t => {
                return {
                    num: plam( self_t, int )
                    ( self => self.thing )
                }
            });

            const dummy = plam( Thing.type, int )
            ( thing => 
                plet( thing ).in( t =>
                    t.thing
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("plet( alias_with_methods ).in( thing => ... )", () => {

            const Thing =  palias(
                bs,
                self_t => {
                    return {
                        num: plam( self_t, int )
                        ( self => self.at(0) )
                    }
                }
            );

            const dummy = plam( Thing.type, int )
            ( thing => 
                plet( thing ).in( t =>
                    t.num
                )
            )

            const uplc = dummy.toUPLC();

        });

        test("value", () => {

            const thing = plam( PValue.type, int )
            ( val =>
                plet( val.head.policy ).in( policy =>
                    plet( val.head.assets ).in( assets =>
                        
                        pInt(0)
                    ) 
                ) 
            );

            const uplc = thing.toUPLC();

        });

    })

})