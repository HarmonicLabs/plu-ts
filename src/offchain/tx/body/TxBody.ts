import { NetworkT } from "../../Network";
import { CanBeUInteger, forceUInteger } from "../../../types/ints/Integer";
import Coin from "../../Coin";
import Certificate, { AnyCertificate } from "../../ledger/certs/Certificate";
import TxWithdrawals from "../../ledger/TxWithdrawals";
import { Value } from "../../Value";
import TxOut from "./output/TxOut";
import TxIn from "./TxIn";
import PubKeyHash from "../../credentials/PubKeyHash";
import ProtocolUpdateProposal from "../../ledger/protocol/ProtocolUpdateProposal";
import AuxiliaryDataHash from "../../hashes/Hash32/AuxiliaryDataHash";
import ScriptDataHash from "../../hashes/Hash32/ScriptDataHash";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import TxOutRef from "./output/TxOutRef";
import { UInteger } from "../../..";

type Utxo = TxIn | TxOutRef;

export interface ITxBody {
    inputs: [ Utxo, ...Utxo[] ],
    outputs: TxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: AnyCertificate[],
    withdrawals?: TxWithdrawals,
    protocolUpdate?: ProtocolUpdateProposal,
    auxDataHash?: AuxiliaryDataHash, // hash 32
    mint?: Value,
    scriptDataHash?: ScriptDataHash, // hash 32
    collateralInputs?: TxIn[], 
    requiredSigners?: PubKeyHash[],
    network?: NetworkT,
    collateralReturn?: TxOut,
    totCollateral?: Coin,
    refInputs?: Utxo[]
}

export default class TxBody
    implements ITxBody
{
    readonly inputs!: [ TxIn, ...TxIn[] ];
    readonly outputs!: TxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: AnyCertificate[];
    readonly withdrawals: TxWithdrawals;
    readonly protocolUpdate: ProtocolUpdateProposal;
    readonly auxDataHash: AuxiliaryDataHash; // hash 32
    readonly mint: Value;
    readonly scriptDataHash: ScriptDataHash; // hash 32
    readonly collateralInputs: TxIn[];
    readonly requiredSigners: PubKeyHash[];
    readonly network: NetworkT;
    readonly collateralReturn: TxOut;
    readonly totCollateral: bigint;
    readonly refInputs: TxIn[];

    constructor( body: ITxBody )
    {
        JsRuntime.assert(
            ObjectUtils.hasOwn( body, "inputs" ) &&
            ObjectUtils.hasOwn( body, "outputs" ) &&
            ObjectUtils.hasOwn( body, "fee" ),
            "can't construct a 'TxBody' if 'inputs', 'outputs' and 'fee' fields aren't present"
        );
        
        const {
            inputs,
            outputs,
            fee,
            ttl,
            certs,
            withdrawals,
            protocolUpdate,
            auxDataHash,
            mint,
            scriptDataHash,
            collateralInputs,
            requiredSigners,
            network,
            collateralReturn,
            totCollateral,
            refInputs
        } = body;

        // -------------------------------------- inputs -------------------------------------- //
        JsRuntime.assert(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( input => input instanceof TxOutRef ),
            "invald 'inputs' field"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "inptus",
            Object.freeze(
                inputs.map( i => i instanceof TxIn ? i : new TxIn( i.id, i.index ) )
            )
        );

        // -------------------------------------- outputs -------------------------------------- //
        JsRuntime.assert(
            Array.isArray( outputs )  &&
            outputs.length > 0 &&
            outputs.every( out => out instanceof TxOut ),
            "invald 'outputs' field"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "outputs",
            Object.freeze( outputs )
        );

        // -------------------------------------- fee -------------------------------------- //
        JsRuntime.assert(
            (typeof fee === "number" && fee === Math.round( Math.abs( fee ) ) ) ||
            (typeof fee === "bigint" && fee >= BigInt( 0 ) ) ||
            (fee instanceof UInteger),
            "invald 'fee' field"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "fee",
            forceUInteger( fee ).asBigInt
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "ttl",
            ttl === undefined ? undefined : forceUInteger( ttl ).asBigInt
        );

        // -------------------------------------- certs -------------------------------------- //
        if( certs !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( certs )  &&
                certs.every( cert => cert instanceof Certificate),
                "invalid 'certs' field"
            );

            if( certs.length <= 0 )
            {
                ObjectUtils.defineReadOnlyProperty(
                    this,
                    "certs",
                    undefined
                );
            }

            ObjectUtils.defineReadOnlyProperty(
                this,
                "certs",
                Object.freeze( certs )
            );
        }
        else ObjectUtils.defineReadOnlyProperty(
            this,
            "certs",
            undefined
        );

        // -------------------------------------- withdrawals -------------------------------------- //
        
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        
        // -------------------------------------- auxDataHash -------------------------------------- //
        
        
        // -------------------------------------- mint -------------------------------------- //
        
        
        // -------------------------------------- scriptDataHash -------------------------------------- //
        
        
        // -------------------------------------- collateral inputs -------------------------------------- //
        
        
        // -------------------------------------- requiredSigners -------------------------------------- //
        
        
        // -------------------------------------- network -------------------------------------- //
        
        
        // -------------------------------------- collateralReturn -------------------------------------- //
        
        
        // -------------------------------------- totCollateral -------------------------------------- //
        
        
        // -------------------------------------- reference inputs -------------------------------------- //
    }
};