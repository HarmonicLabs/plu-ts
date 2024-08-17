import { pfn, pif, pisEmpty } from "../../../.."
import { Machine } from "@harmoniclabs/plutus-machine"
import { int, lam, list } from "../../../../../type_system"
import { pdelay } from "../../../../pdelay"
import { pInt } from "../../../int"
import { precursiveList } from "../index";
import { getHoistedTerms, getSortedHoistedSet, IRApp, IRConst, IRDelayed, IRForced, IRFunc, IRHoisted, IRNative, IRVar, prettyIRJsonStr, showIR } from "../../../../../../IR"
import { handleHoistedAndReturnRoot } from "../../../../../../IR/toUPLC/subRoutines/handleHoistedAndReturnRoot"
import { replaceNativesAndReturnRoot } from "../../../../../../IR/toUPLC/subRoutines/replaceNatives"
import { floatAsBytes } from "../../../../../../IR/murmur"
import { toHex } from "@harmoniclabs/uint8array-utils"
import { nativeToIR } from "../../../../../../IR/toUPLC/subRoutines/replaceNatives/nativeToIR"


const plast =  precursiveList( int, int )
    .$( _ => pdelay( pInt( -1 ) ) )
    .$(
        pfn([
            lam( list( int ), int ),
            int, list( int ) 
        ], int )
        (( self, head, tail ) =>
            pif( int ).$( pisEmpty.$( tail ) )
            .then( head )
            .else( self.$( tail ) )
        )
    );

describe("precursiveList low level", () => {

    const hoisted_pmatchList = (
        new IRHoisted(
            new IRFunc( 1, // a (matchNil)
                new IRFunc( 1, // b (matchCons)
                    new IRFunc( 1, // c (lst)
                        new IRForced(
                            new IRApp(
                                new IRApp(
                                    new IRApp(
                                        IRNative.strictChooseList,
                                        new IRVar( 0 ) // c (lst)
                                    ),
                                    new IRVar( 2 ) // a (matchNil)
                                ),
                                new IRDelayed(
                                    new IRApp(
                                        new IRApp(
                                            new IRVar( 1 ), // b (matchCons)
                                            new IRApp(
                                                IRNative.headList,
                                                new IRVar( 0 ) // c (lst)
                                            )
                                        ),
                                        new IRApp(
                                            IRNative.tailList,
                                            new IRVar( 0 ) // c (lst)
                                        )
                                    )
                                )
                            )
                        ),
                        "pmatchList"
                    ),
                    "pmatchList"
                ),
                "pmatchList"
            ),
            { name: "pmatchList" }
        )
    );
    
    const hoisted_precList = (
        new IRHoisted(
            new IRApp(
                IRNative.z_comb,
                new IRFunc( 1, // a (self)
                    new IRFunc( 1, // b (matchNil)
                        new IRFunc( 1, // c (matchCons)
                            new IRFunc( 1, // d (lst)
                                new IRApp(
                                    new IRFunc( 1, // e ( finalSelf )
                                        new IRApp(
                                            new IRApp(
                                                new IRApp(
                                                    hoisted_pmatchList,
                                                    new IRApp(
                                                        new IRVar( 3 ), // b
                                                        new IRVar( 0 ) // e
                                                    )
                                                ),
                                                new IRApp(
                                                    new IRVar( 2 ), // c
                                                    new IRVar( 0 ) // e
                                                )
                                            ),
                                            new IRVar( 1 ) // d (lst)
                                        )
                
                                    ),
                                    new IRApp(
                                        new IRApp(
                                            new IRVar( 3 ), // a (self)
                                            new IRVar( 2)  // b (matchNil)
                                        ),
                                        new IRVar( 1 ) // c (matchCons)
                                    )
                                ),
                                "precursiveList"
                            ),
                            "precursiveList"
                        ),
                        "precursiveList"
                    ),
                    "precursiveList"
                )
            )
        )
    );

    const nil_plast = (
        new IRApp(
            new IRApp(
                new IRApp(
                    hoisted_precList,
                    new IRFunc( 1, // a
                        new IRDelayed(
                            new IRConst( int, -1 )
                        )
                    )
                ),
                new IRFunc( 1, // a
                    new IRFunc( 1, // b
                        new IRFunc( 1, // c
                            new IRForced(
                                new IRApp(
                                    new IRApp(
                                        new IRApp(
                                            IRNative.strictIfThenElse,
                                            new IRApp(
                                                IRNative.nullList,
                                                new IRVar( 0 ) // c
                                            )
                                        ),
                                        new IRDelayed(
                                            new IRVar( 1 ) // b
                                        )
                                    ),
                                    new IRDelayed(
                                        new IRApp(
                                            new IRVar( 2 ), // a
                                            new IRVar( 0 ) // c
                                        )
                                    )
                                )
                            )
                        ),
                        "curried_lam"
                    ),
                    "curried_lam"
                )
            ),
            IRConst.listOf( int )( [] )
        )
    );

    const generated = plast.$([] as any).toIR();

    test("correct hoisted compilation", () => {
        expect( prettyIRJsonStr( nil_plast ) )
        .toEqual( prettyIRJsonStr( generated ))
    });

    expect( 
        getHoistedTerms( nil_plast )
        .map(({ hoisted, nReferences }) => ({ hoisted: hoisted.toJson(), nReferences })) 
    ).toEqual(
        getHoistedTerms( generated )
        .map(({ hoisted, nReferences }) => ({ hoisted: hoisted.toJson(), nReferences })) 
    );
    
    expect(
        getSortedHoistedSet( getHoistedTerms( nil_plast ) )
        .map(({ hoisted, nReferences }) => ({ hoisted: hoisted.toJson(), nReferences })) 
    )
    .toEqual(
        getSortedHoistedSet( getHoistedTerms( generated ) )
        .map(({ hoisted, nReferences }) => ({ hoisted: hoisted.toJson(), nReferences })) 
    );

    // console.log( "z_comb:", toHex( floatAsBytes( nativeToIR( IRNative.z_comb ).hash ) ) );
    // console.log( "pmatch:", toHex( floatAsBytes( hoisted_pmatchList.hash ) ) );

    expect(
        nativeToIR( IRNative.z_comb ).hash
    ).not.toEqual( hoisted_pmatchList.hash );

    let term = replaceNativesAndReturnRoot( generated.clone() );
    term = handleHoistedAndReturnRoot( term );
});

describe("precursiveList", () => {

    test("nil", () => {

        expect(
            Machine.evalSimple(
                plast.$([] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( -1 )
            )
        )

    });

    test("[42]", () => {

        expect(
            Machine.evalSimple(
               plast.$([pInt( 42 )] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        )

    });

    test("[42,69]", () => {

        expect(
            Machine.evalSimple(
               plast.$([pInt( 42 ), pInt(69) ] as any)
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 69 )
            )
        )

    });

})