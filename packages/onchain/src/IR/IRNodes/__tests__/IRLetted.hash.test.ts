import { toHex } from "@harmoniclabs/uint8array-utils";
import { IRApp, IRFunc, IRHoisted, IRNative } from "..";
import { int } from "../../../pluts";
import { IRTerm } from "../../IRTerm";
import { IRConst } from "../IRConst";
import { IRLetted, getNormalizedLettedArgs } from "../IRLetted";
import { IRVar } from "../IRVar"


describe("IRLetted.hash", () => {

    test("same value with vars; different dbn => different hash", () => {

        const value = new IRVar(0);

        const a = new IRLetted( 1, value.clone() );
        const b = new IRLetted( 2, value.clone() );

        expect( a.value.hash ).toEqual( b.value.hash );
        expect( a.hash ).not.toEqual( b.hash );

    });

    test("different dbn doesn't apply if letted value doesn't include vars", () => {

        const value = new IRConst( int, 2 );

        const a = new IRLetted( 1, value.clone() );
        const b = new IRLetted( 2, value.clone() );

        expect( a.value.hash ).toEqual( b.value.hash );
        expect( a.hash ).toEqual( b.hash );

    });

    test("different vars; proportilonally different letted dbn => same hash", () => {

        const a = new IRLetted( 4, new IRVar( 1 ) );
        const b = new IRLetted( 6, new IRVar( 3 ) );

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).toEqual( b.hash );

    });

    test("different vars; un-proportilonally different letted dbn => different hash", () => {

        const a = new IRLetted( 4, new IRVar( 1 ) );
        const b = new IRLetted( 7, new IRVar( 3 ) );

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).not.toEqual( b.hash );

    });

    test.only("tempura ownHash", () => {
        function elem_at_( n: number ): IRTerm
        {
            if( n < 0 || n !== Math.round(n) )
            throw new Error(
                "unexpected index in pmatch field extraction"
            );

            if( n === 0 ) return IRNative.headList;

            const funcName = "elem_at_" + n.toString();

            let uplc: IRTerm = new IRVar(0);

            const initialN = n;
            while( n > 0 )
            {
                uplc = new IRApp( IRNative.tailList, uplc );
                n--;
            }

            uplc = new IRHoisted(
                new IRFunc(
                    1,
                    new IRApp(
                        IRNative.headList,
                        uplc
                    ),
                    funcName
                )
            );

            return uplc as any;
        }

        const hoisted_getFields = new IRHoisted(
            new IRFunc( 1, // struct
                new IRApp(
                    IRNative.sndPair,
                    new IRApp(
                        IRNative.unConstrData,
                        new IRVar( 0 )
                    )
                ),
                "hoisted_getFields"
            )
        );

        const dbnLevel = 5;
        const varDbn = 1;
        
        const ctxAt1 = new IRLetted(
            dbnLevel,
            new IRApp(
                IRNative.headList,
                new IRLetted( dbnLevel,
                    new IRApp(
                        hoisted_getFields.clone(),
                        new IRLetted( dbnLevel,
                            new IRApp(
                                elem_at_(1),
                                new IRLetted( dbnLevel,
                                    new IRApp(
                                        hoisted_getFields.clone(),
                                        new IRLetted(
                                            dbnLevel,
                                            new IRApp(
                                                IRNative.headList,
                                                new IRLetted( dbnLevel,
                                                    new IRApp(
                                                        IRNative.unListData,
                                                        new IRApp(
                                                            IRNative.headList,
                                                            new IRLetted( dbnLevel,
                                                                new IRApp(
                                                                    hoisted_getFields.clone(),
                                                                    new IRLetted( dbnLevel,
                                                                        new IRApp(
                                                                            IRNative.headList,
                                                                            new IRLetted( dbnLevel,
                                                                                new IRApp(
                                                                                    hoisted_getFields.clone(),
                                                                                    new IRVar( varDbn )
                                                                                )
                                                                            )
                                                                        )
                                                                        , { name: "PScriptContext::tx" }
                                                                    )
                                                                ))
                                                        )
                                                    ),
                                                    { name: "PTxInfos::inputs" })
                                            ),
                                            { name: "list::head" }
                                        )   
                                    )
                                )
                            ),
                            { name: "PTxInInfo::resolved" }
                        )
                    )
                )
            ),
            { name: "PTxOut::address" }
        );

        console.log( toHex(ctxAt1.hash) );
        console.log( getNormalizedLettedArgs( dbnLevel, ctxAt1 ) )
    });
    
})