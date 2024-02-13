import { Machine } from "@harmoniclabs/plutus-machine"
import { pmatch, pstruct } from "../../../../PTypes"
import { bs, int, list, unit } from "../../../../type_system"
import { plet } from "../../../plet"
import { pDataB, pDataI } from "../../data"
import { pInt } from "../../int"
import { passert } from "../../passert"
import { pList } from "../../list/const"
import { PTxOut } from "../../../../API/V2/Tx/PTxOut"
import { phoist } from "../../../phoist"
import { PTxInInfo } from "../../../../API/V2/Tx/PTxInInfo"
import { pfn } from "../../../pfn"
import { UtilityTermOf } from "../addUtilityForType"
import { pmakeUnit } from "../../unit/pmakeUnit"
import { TermStruct } from "../TermStruct"

const SingleCtor = pstruct({
    SingleCtor: {
        num: int,
        byteStr: bs
    }
})

describe("dot notation", () => {

    test("num + bs.length", () => {

        const myStruct = plet(
            SingleCtor.SingleCtor({
                num: pDataI( 2 ),
                byteStr: pDataB("caffee")
            })
        );

        expect(
            Machine.evalSimple(
                myStruct.num.add( myStruct.byteStr.length )
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 2 + 3 )
            )
        );
        
    });

    test("not really", () => {

        // more than 3 inputs not allowed
        const SwapInputIndexes = pstruct({
            Single: { index: int },
            Double: { fst: int, snd: int },
            Triple: { fst: int, snd: int, trd: int }
        }, self_t => {
            const pListTxOut = pList( PTxOut.type );

            // typescript does not infer the methods (plu-ts 0.6.6)
            // to be fixed
            // workaroud: define a separate function
            const resolveSwapInputIndexesInputs = phoist(
                pfn([ self_t, list( PTxInInfo.type ) ], list( PTxOut.type ))
                ( (self, inputs) =>
                    pmatch( self )
                    .onSingle(({ index }) => pListTxOut([ inputs.at( index ).resolved ]) )
                    .onDouble(({ fst, snd }) =>
                        plet(
                            // assert fst and snd are not equal 
                            passert.$( fst.lt( snd ) )
                        ).in( _ => 
                            pListTxOut([
                                inputs.at( fst ).resolved,
                                inputs.at( snd ).resolved,
                            ])
                        )
                    )
                    .onTriple(({ fst, snd, trd }) =>
                        plet(
                            // assert fst, snd and trd are not equal 
                            passert.$( fst.lt( snd ).and( snd.lt( trd ) ) )
                        ).in( _ =>
                            pListTxOut([
                                inputs.at( fst ).resolved,
                                inputs.at( snd ).resolved,
                                inputs.at( trd ).resolved
                            ])
                        )
                    )
                )
            );

            const resolveSwapInputIndexesOutputs = phoist(
                pfn([ self_t, list( PTxOut.type ) ], list( PTxOut.type ))
                ( (self, inputs) =>
                    pmatch( self )
                    .onSingle(({ index }) => pListTxOut([ inputs.at( index ) ]) )
                    .onDouble(({ fst, snd }) =>
                        plet(
                            // assert fst and snd are not equal 
                            passert.$( fst.lt( snd ) )
                        ).in( _ => 
                            pListTxOut([
                                inputs.at( fst ),
                                inputs.at( snd ),
                            ])
                        )
                    )
                    .onTriple(({ fst, snd, trd }) =>
                        plet(
                            // assert fst, snd and trd are not equal 
                            passert.$( fst.lt( snd ).and( snd.lt( trd ) ) )
                        ).in( _ =>
                            pListTxOut([
                                inputs.at( fst ),
                                inputs.at( snd ),
                                inputs.at( trd )
                            ])
                        )
                    )
                )
            );

            const getSwapInputIndexesLength = phoist(
                pfn([ self_t ], int)
                ( userIn => userIn.raw.index.add( 1 ) )
            );

            return {
                resolveInputs: resolveSwapInputIndexesInputs,
                resolveOutputs: resolveSwapInputIndexesOutputs,
                length: getSwapInputIndexesLength
            };
        });

        pfn([ SwapInputIndexes.type ], unit)
        ( idxs => {

            idxs.length
            return pmakeUnit();
        })
        

    })
})