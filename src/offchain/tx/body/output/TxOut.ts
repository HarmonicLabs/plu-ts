import Data, { isData } from "../../../../types/Data";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Script from "../../../script/Script";
import { Value } from "../../../ledger/Value";
import TxOutRef, { ITxOutRef } from "./TxOutRef";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

export interface ITxOut {
    // TODO: needs to be something more specific
    address: string,
    amount: Value,
    datum?: Hash32 | Data,
    refScript?: Script,
    ref?: TxOutRef
}
export default class TxOut
    implements ITxOut
{
    // TODO: needs to be something more specific
    readonly address!: string
    readonly amount!: Value
    readonly datum?: Hash32 | Data
    readonly refScript?: Script
    readonly ref?: TxOutRef

    constructor( txOutput: ITxOut )
    {
        JsRuntime.assert(
            ObjectUtils.isObject( txOutput ) &&
            ObjectUtils.hasOwn( txOutput, "address" ) &&
            ObjectUtils.hasOwn( txOutput, "amount" ),
            "txOutput is missing some necessary fields"
        );

        const {
            address,
            amount,
            datum,
            refScript,
            ref
        } = txOutput;

        JsRuntime.assert(
            // TODO: needs to be something more specific
            typeof address === "string",
            "invlaid 'address' while constructing 'TxOut'" 
        );
        JsRuntime.assert(
            // TODO: needs to be something more specific
            amount instanceof Value,
            "invlaid 'amount' while constructing 'TxOut'" 
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "address",
            address
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "amount",
            amount
        );

        if( datum !== undefined )
            JsRuntime.assert(
                datum instanceof Hash32 || isData( datum ),
                "invalid 'datum' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "datum",
            datum
        );

        if( refScript !== undefined )
            JsRuntime.assert(
                refScript instanceof Script,
                "invalid 'refScript' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "refScript",
            refScript
        );

        if( ref !== undefined )
            JsRuntime.assert(
                ref instanceof TxOutRef,
                "invalid 'ref' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "ref",
            ref
        );
    }
}