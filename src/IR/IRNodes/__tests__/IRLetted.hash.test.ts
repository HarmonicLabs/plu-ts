import { toHex } from "@harmoniclabs/uint8array-utils";
import { IRApp, IRFunc, IRHoisted, IRNative } from "..";
import { int } from "../../../type_system";
import { IRTerm } from "../../IRTerm";
import { IRConst } from "../IRConst";
import { IRLetted, getNormalizedLettedArgs } from "../IRLetted";
import { IRVar } from "../IRVar"
import { prettyIRJsonStr } from "../../utils";

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

        const a = new IRLetted( 4, new IRVar( 1 ) ); // points at 3rd (4 - 1) var in scope
        const b = new IRLetted( 6, new IRVar( 3 ) ); // points at 3rd (6 - 3) var in scope

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).toEqual( b.hash );

    });

    test("different vars values; un-proportilonally different letted dbn => different hash", () => {

        const a = new IRLetted( 4, new IRVar( 1 ) ); // points at 3rd (4 - 1) var in scope
        const normalized_a = getNormalizedLettedArgs( 4, a.value )!;
        const b = new IRLetted( 7, new IRVar( 3 ) ); // points at 4th (7 - 3) var in scope
        const normalized_b = getNormalizedLettedArgs( 7, b.value )!;

        // console.log( normalized_a[0], prettyIRJsonStr( normalized_a[1] ) );
        // console.log( normalized_b[0], prettyIRJsonStr( normalized_b[1] ) );

        expect( a.value.hash ).not.toEqual( b.value.hash );
        expect( a.hash ).not.toEqual( b.hash );

    });

    test("tempura ownHash", () => {
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

        expect( getNormalizedLettedArgs( dbnLevel, ctxAt1 )?.[0] ).toEqual( 4 ) 
    });

    test("head of -1", () => {

        function getTerm( dbn: number, varDbn: number )
        {
            return new IRLetted( dbn, new IRApp( IRNative.headList, new IRVar(varDbn) ) );
        }

        const _50 = getTerm( 5, 0 );
        const _61 = getTerm( 6, 1 );
        const _60 = getTerm( 6, 0 );

        expect( _50.hash ).toEqual( _61.hash );
        expect( _50.hash ).not.toEqual( _60.hash );
    })
})