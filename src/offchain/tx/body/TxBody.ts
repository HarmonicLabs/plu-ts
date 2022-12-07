import { NetworkT } from "../../ledger/Network";
import { canBeUInteger, CanBeUInteger, forceUInteger } from "../../../types/ints/Integer";
import Coin from "../../ledger/Coin";
import Certificate, { AnyCertificate } from "../../ledger/certs/Certificate";
import TxWithdrawals from "../../ledger/TxWithdrawals";
import { Value } from "../../ledger/Value";
import TxOut from "./output/TxOut";
import TxIn from "./TxIn";
import PubKeyHash from "../../credentials/PubKeyHash";
import ProtocolUpdateProposal, { isProtocolParametersUpdate } from "../../ledger/protocol/ProtocolUpdateProposal";
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
    readonly withdrawals?: TxWithdrawals;
    readonly protocolUpdate?: ProtocolUpdateProposal;
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash; // hash 32
    readonly collateralInputs?: TxIn[];
    readonly requiredSigners?: PubKeyHash[];
    readonly network?: NetworkT;
    readonly collateralReturn?: TxOut;
    readonly totCollateral?: bigint;
    readonly refInputs?: TxIn[];

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
        
        if( withdrawals !== undefined )
        JsRuntime.assert(
            withdrawals instanceof TxWithdrawals,
            "withdrawals was not udnefined nor an instance of 'TxWithdrawals'"
        )

        ObjectUtils.defineReadOnlyProperty(
            this,
            "withdrawals",
            withdrawals
        );
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        if( protocolUpdate !== undefined )
        {
            JsRuntime.assert(
                isProtocolParametersUpdate( protocolUpdate ),
                "invalid 'protocolUpdate' while constructing a 'Tx'"
            )
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "protocolUpdate",
            protocolUpdate
        );
        
        // -------------------------------------- auxDataHash -------------------------------------- //
        
        if( auxDataHash !== undefined )
        {
            JsRuntime.assert(
                auxDataHash instanceof AuxiliaryDataHash,
                "invalid 'auxDataHash' while constructing a 'Tx'"
            )
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "auxDataHash",
            auxDataHash
        );
        

        // -------------------------------------- mint -------------------------------------- //
        
        if( mint !== undefined )
        {
            JsRuntime.assert(
                mint instanceof Value,
                "invalid 'mint' while constructing a 'Tx'"
            )
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "mint",
            mint
        );
        
        // -------------------------------------- scriptDataHash -------------------------------------- //
        
        if( scriptDataHash !== undefined )
        {
            JsRuntime.assert(
                scriptDataHash instanceof ScriptDataHash,
                "invalid 'scriptDataHash' while constructing a 'Tx'"
            )
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "scriptDataHash",
            scriptDataHash
        );

        // -------------------------------------- collateral inputs -------------------------------------- //

        if( collateralInputs !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( collateralInputs ) &&
                collateralInputs.every( input => input instanceof TxOutRef ),
                "invalid 'collateralInputs' while constructing a 'Tx'"
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "collateralInputs",
            collateralInputs?.length === 0 ? undefined : Object.freeze( collateralInputs )
        );
        
        // -------------------------------------- requiredSigners -------------------------------------- //
        requiredSigners
        if( requiredSigners !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( requiredSigners ) &&
                requiredSigners.every( sig => sig instanceof PubKeyHash ),
                "invalid 'requiredSigners' while constructing a 'Tx'"
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "requiredSigners",
            requiredSigners?.length === 0 ? undefined : Object.freeze( requiredSigners )
        );

        // -------------------------------------- network -------------------------------------- //
        
        if( network !== undefined )
        JsRuntime.assert(
            network === "mainnet" ||
            network === "testnet",
            "invalid 'network' while constructing 'Tx'"
        )
        
        ObjectUtils.defineReadOnlyProperty(
            this,
            "network",
            network
        );

        // -------------------------------------- collateralReturn -------------------------------------- //
        
        if( collateralReturn !== undefined )
        JsRuntime.assert(
            collateralReturn instanceof TxOut,
            "invalid 'collateralReturn' while constructing 'Tx'"
        )
        
        ObjectUtils.defineReadOnlyProperty(
            this,
            "collateralReturn",
            collateralReturn
        );
        // -------------------------------------- totCollateral -------------------------------------- //
        totCollateral
        if( totCollateral !== undefined )
        JsRuntime.assert(
            canBeUInteger( totCollateral ),
            "invalid 'collateralReturn' while constructing 'Tx'"
        )
        
        ObjectUtils.defineReadOnlyProperty(
            this,
            "collateralReturn",
            totCollateral === undefined ? undefined : forceUInteger( totCollateral ).asBigInt
        );

        // -------------------------------------- reference inputs -------------------------------------- //

        if( refInputs !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( refInputs ) &&
                refInputs.every( input => input instanceof TxOutRef ),
                "invalid 'refInputs' while constructing a 'Tx'"
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "refInputs",
            refInputs?.length === 0 ? undefined : Object.freeze( refInputs )
        );

    }
};