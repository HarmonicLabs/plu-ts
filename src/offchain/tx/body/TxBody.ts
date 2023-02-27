import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { UInteger } from "../../../types/ints/Integer";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { CborMap, CborMapEntry } from "../../../cbor/CborObj/CborMap";
import { Certificate, AnyCertificate, certificatesToDepositLovelaces } from "../../ledger/certs/Certificate";
import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ProtocolUpdateProposal, isProtocolUpdateProposal, protocolUpdateProposalFromCborObj, protocolUpdateProposalToCborObj, protocolUpdateToJson } from "../../ledger/protocol/ProtocolUpdateProposal";
import { blake2b_256 } from "../../../crypto";
import { NetworkT } from "../../ledger/Network";
import { canBeUInteger, CanBeUInteger, forceBigUInt } from "../../../types/ints/Integer";
import { TxWithdrawals, ITxWithdrawals, canBeTxWithdrawals, forceTxWithdrawals } from "../../ledger/TxWithdrawals";
import { Value } from "../../ledger/Value/Value";
import { Coin } from "../../ledger/Coin";
import { TxOut } from "./output/TxOut";
import { PubKeyHash } from "../../credentials/PubKeyHash";
import { AuxiliaryDataHash } from "../../hashes/Hash32/AuxiliaryDataHash";
import { ScriptDataHash } from "../../hashes/Hash32/ScriptDataHash";
import { CborObj } from "../../../cbor/CborObj";
import { Cbor } from "../../../cbor/Cbor";
import { CborUInt } from "../../../cbor/CborObj/CborUInt";
import { CborArray } from "../../../cbor/CborObj/CborArray";
import { Hash32 } from "../../hashes/Hash32/Hash32";
import { ToJson } from "../../../utils/ts/ToJson";
import { TxOutRef, UTxO } from "./output/UTxO";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";

export interface ITxBody {
    inputs: [ UTxO, ...UTxO[] ],
    outputs: TxOut[],
    fee: Coin,
    ttl?: CanBeUInteger,
    certs?: AnyCertificate[],
    withdrawals?: TxWithdrawals | ITxWithdrawals,
    protocolUpdate?: ProtocolUpdateProposal,
    auxDataHash?: AuxiliaryDataHash, // hash 32
    validityIntervalStart?: CanBeUInteger,
    mint?: Value,
    scriptDataHash?: ScriptDataHash, // hash 32
    collateralInputs?: UTxO[], 
    requiredSigners?: PubKeyHash[],
    network?: NetworkT,
    collateralReturn?: TxOut,
    totCollateral?: Coin,
    refInputs?: UTxO[]
}

export function isITxBody( body: Readonly<object> ): body is ITxBody
{
    if( !ObjectUtils.isObject( body ) ) return false;

    const fields = Object.keys( body );
    const b = body as ITxBody;

    return (
        fields.length >= 3 &&
        
        ObjectUtils.hasOwn( b, "inputs" ) &&
        Array.isArray( b.inputs ) && b.inputs.length > 0 &&
        b.inputs.every( _in => _in instanceof UTxO ) &&
        
        ObjectUtils.hasOwn( b, "outputs" ) &&
        Array.isArray( b.outputs ) && b.outputs.length > 0 &&
        b.outputs.every( _in => _in instanceof TxOut ) &&

        ObjectUtils.hasOwn( b, "fee" ) && canBeUInteger( b.fee ) &&

        ( b.ttl === undefined || canBeUInteger( b.ttl ) ) &&
        ( b.certs === undefined || b.certs.every( c => c instanceof Certificate ) ) &&
        ( b.withdrawals === undefined || canBeTxWithdrawals( b.withdrawals ) ) &&
        ( b.protocolUpdate === undefined || isProtocolUpdateProposal( b.protocolUpdate ) ) &&
        ( b.auxDataHash === undefined || b.auxDataHash instanceof Hash32 ) &&
        ( b.validityIntervalStart === undefined || canBeUInteger( b.validityIntervalStart ) ) &&
        ( b.mint === undefined || b.mint instanceof Value ) &&
        ( b.scriptDataHash === undefined || b.scriptDataHash instanceof Hash32 ) &&
        ( b.collateralInputs === undefined || (
            Array.isArray( b.collateralInputs ) && 
            b.collateralInputs.every( collateral => collateral instanceof UTxO )
        )) &&
        ( b.requiredSigners === undefined || (
            Array.isArray( b.requiredSigners ) &&
            b.requiredSigners.every( sig => sig instanceof PubKeyHash )
        )) &&
        ( b.network === undefined || b.network === "mainnet" || b.network === "testnet" ) &&
        ( b.collateralReturn === undefined || (
            Array.isArray( b.collateralReturn ) &&
            b.collateralReturn.every( ret => ret instanceof TxOut )
        )) &&
        ( b.totCollateral === undefined || canBeUInteger( b.totCollateral ) ) &&
        ( b.refInputs === undefined || (
            Array.isArray( b.refInputs ) &&
            b.refInputs.every( ref => ref instanceof UTxO )
        ))
    )
}

export class TxBody
    implements ITxBody, ToCbor, ToJson
{
    readonly inputs!: [ UTxO, ...UTxO[] ];
    readonly outputs!: TxOut[];
    readonly fee!: bigint;
    readonly ttl?: bigint;
    readonly certs?: AnyCertificate[];
    readonly withdrawals?: TxWithdrawals;
    readonly protocolUpdate?: ProtocolUpdateProposal;
    readonly auxDataHash?: AuxiliaryDataHash; // hash 32
    readonly validityIntervalStart?: bigint;
    readonly mint?: Value;
    readonly scriptDataHash?: ScriptDataHash; // hash 32
    readonly collateralInputs?: UTxO[];
    readonly requiredSigners?: PubKeyHash[];
    readonly network?: NetworkT;
    readonly collateralReturn?: TxOut;
    readonly totCollateral?: bigint;
    readonly refInputs?: UTxO[];

    /**
     * getter
     */
    readonly hash!: Hash32;

    /**
     * 
     * @param body object describing the transaction
     * @throws only if the the `body` parameter does not respect the `ITxBody` interface
     *      **DOES NOT THROW** if the transaction is unbalanced; that needs to be checked using `TxBody.isValueConserved` static method
     */
    constructor( body: ITxBody )
    {
        JsRuntime.assert(
            (ObjectUtils.hasOwn( body, "inputs" ) as any) &&
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
            validityIntervalStart,
            mint,
            scriptDataHash,
            collateralInputs,
            requiredSigners,
            network,
            collateralReturn,
            totCollateral,
            refInputs
        } = body;

        let _isHashValid: boolean = false;
        let _hash: Hash32;

        // -------------------------------------- inputs -------------------------------------- //
        JsRuntime.assert(
            Array.isArray( inputs )  &&
            inputs.length > 0 &&
            inputs.every( input => input instanceof UTxO ),
            "invald 'inputs' field"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "inputs",
            Object.freeze(
                inputs.map( i => i instanceof UTxO ? i : new UTxO( i ) )
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
        let _fee = forceBigUInt( fee );
        ObjectUtils.definePropertyIfNotPresent(
            this,
            "fee",
            {
                get: () => _fee,
                set: ( ...whatever: any[] ) => {},
                enumerable: true,
                configurable: false
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "ttl",
            ttl === undefined ? undefined : forceBigUInt( ttl )
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
            canBeTxWithdrawals( withdrawals ),
            "withdrawals was not undefined nor an instance of 'TxWithdrawals'"
        )

        ObjectUtils.defineReadOnlyProperty(
            this,
            "withdrawals",
            withdrawals === undefined ? undefined : forceTxWithdrawals( withdrawals )
        );
        
        // -------------------------------------- protocolUpdate -------------------------------------- //
        
        if( protocolUpdate !== undefined )
        {
            JsRuntime.assert(
                isProtocolUpdateProposal( protocolUpdate ),
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
        
        // -------------------------------------- validityIntervalStart -------------------------------------- //
                
        if( validityIntervalStart !== undefined )
        {
            JsRuntime.assert(
                canBeUInteger( validityIntervalStart ),
                "invalid 'validityIntervalStart' while constructing a 'Tx'"
            )
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "validityIntervalStart",
            validityIntervalStart === undefined ? undefined : forceBigUInt( validityIntervalStart )
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
                collateralInputs.every( input => input instanceof UTxO ),
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

        if( totCollateral !== undefined )
        JsRuntime.assert(
            canBeUInteger( totCollateral ),
            "invalid 'collateralReturn' while constructing 'Tx'"
        )
        
        ObjectUtils.defineReadOnlyProperty(
            this,
            "collateralReturn",
            totCollateral === undefined ? undefined : forceBigUInt( totCollateral )
        );

        // -------------------------------------- reference inputs -------------------------------------- //  

        if( refInputs !== undefined )
        JsRuntime.assert(
            Array.isArray( refInputs ) &&
            refInputs.every( input => input instanceof UTxO ),
            "invalid 'refInputs' while constructing a 'Tx'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "refInputs",
            refInputs?.length === 0 ? undefined : Object.freeze( refInputs )
        );

        // -------------------------------------- hash -------------------------------------- //  

        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: (): Hash32 => {
                    if( _isHashValid === true && _hash !== undefined && _hash instanceof Hash32 ) return _hash.clone();

                    _hash = new Hash32(
                        Buffer.from(
                            blake2b_256( this.toCbor().asBytes )
                        )
                    );
                    _isHashValid = true;

                    return _hash.clone()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborMap(([
            {
                k: new CborUInt( 0 ),
                v: new CborArray( this.inputs.map( input => input.utxoRef.toCborObj() ) )
            },
            {
                k: new CborUInt( 1 ),
                v: new CborArray( this.outputs.map( out => out.toCborObj() ) )
            },
            {
                k: new CborUInt( 2 ),
                v: new CborUInt( this.fee )
            },
            this.ttl === undefined ? undefined :
            {
                k: new CborUInt( 3 ),
                v: new CborUInt( this.ttl )
            },
            this.certs === undefined || this.certs.length === 0 ? undefined :
            {
                k: new CborUInt( 4 ),
                v: new CborArray( this.certs.map( cert => cert.toCborObj() ) )
            },
            this.withdrawals === undefined ? undefined :
            {
                k: new CborUInt( 5 ),
                v: this.withdrawals.toCborObj()
            },
            this.protocolUpdate === undefined ? undefined :
            {
                k: new CborUInt( 6 ),
                v: protocolUpdateProposalToCborObj( this.protocolUpdate )
            },
            this.auxDataHash === undefined ? undefined :
            {
                k: new CborUInt( 7 ),
                v: this.auxDataHash.toCborObj()
            },
            this.validityIntervalStart === undefined ? undefined :
            {
                k: new CborUInt( 8 ),
                v: new CborUInt( this.validityIntervalStart )
            },
            this.mint === undefined ? undefined :
            {
                k: new CborUInt( 9 ),
                v: this.mint.toCborObj()
            },
            this.scriptDataHash === undefined ? undefined :
            {
                k: new CborUInt( 11 ),
                v: this.scriptDataHash.toCborObj()
            },
            this.collateralInputs === undefined || this.collateralInputs.length === 0 ? undefined :
            {
                k: new CborUInt( 13 ),
                v: new CborArray( this.collateralInputs.map( collateral => collateral.utxoRef.toCborObj() ) )
            },
            this.requiredSigners === undefined || this.requiredSigners.length === 0 ? undefined :
            {
                k: new CborUInt( 14 ),
                v: new CborArray( this.requiredSigners.map( signer => signer.toCborObj() ) )
            },
            this.network === undefined ? undefined :
            {
                k: new CborUInt( 15 ),
                v: new CborUInt(this.network === "testnet" ? 0 : 1)
            },
            this.collateralReturn === undefined ? undefined :
            {
                k: new CborUInt( 16 ),
                v: this.collateralReturn.toCborObj()
            },
            this.totCollateral === undefined ? undefined :
            {
                k: new CborUInt( 17 ),
                v: new CborUInt( this.totCollateral )
            },
            this.refInputs === undefined || this.refInputs.length === 0 ? undefined :
            {
                k: new CborUInt( 18 ),
                v: new CborArray( this.refInputs.map( refIn => refIn.utxoRef.toCborObj() ) )
            }
        ].filter( entry => entry !== undefined ) as CborMapEntry[]))
    }

    static fromCbor( cStr: CanBeCborString ): TxBody
    {
        return TxBody.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxBody
    {
        if(!(cObj instanceof CborMap))
        throw new InvalidCborFormatError("TxBody")

        let fields: (CborObj | undefined)[] = new Array( 19 ).fill( undefined );

        for( let i = 0; i < 19; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined ) continue;

            fields[i] = v;
        }

        const [
            _ins,
            _outs,
            _fee,
            _ttl,
            _certs,
            _withdrawals,
            _pUp,
            _auxDataHash,
            _validityStart,
            _mint,
            _scriptDataHash,
            _collIns,
            _reqSigs,
            _net,
            _collRet,
            _totColl,
            _refIns
        ] = fields;

        if( _ins === undefined || _outs === undefined || _fee === undefined )
        throw new InvalidCborFormatError("TxBody");

        if(!(
            _ins  instanceof CborArray &&
            _outs instanceof CborArray &&
            _fee  instanceof CborUInt
        ))
        throw new InvalidCborFormatError("TxBody");

        let ttl: bigint | undefined = undefined;
        if( _ttl !== undefined )
        {
            if(!( _ttl instanceof CborUInt ))
            throw new InvalidCborFormatError("TxBody");

            ttl = _ttl.num;
        }

        return new TxBody({
            inputs: _ins.array.map( txOutRefAsUTxOFromCborObj ) as [UTxO, ...UTxO[]],
            outputs: _outs.array.map( TxOut.fromCborObj ),
            fee: _fee.num,
            ttl,
            certs:                      _certs instanceof CborArray ? _certs.array.map( Certificate.fromCborObj ) : undefined,
            withdrawals:                _withdrawals === undefined ? undefined : TxWithdrawals.fromCborObj( _withdrawals ),
            protocolUpdate:             _pUp === undefined ? undefined : protocolUpdateProposalFromCborObj( _pUp ),
            auxDataHash:                _auxDataHash === undefined ? undefined : AuxiliaryDataHash.fromCborObj( _auxDataHash ),
            validityIntervalStart:      _validityStart instanceof CborUInt ? _validityStart.num : undefined,
            mint:                       _mint === undefined ? undefined : Value.fromCborObj( _mint ),
            scriptDataHash:             _scriptDataHash === undefined ? undefined : ScriptDataHash.fromCborObj( _scriptDataHash ),
            collateralInputs:           _collIns instanceof CborArray ? _collIns.array.map( txOutRefAsUTxOFromCborObj ) : undefined ,
            requiredSigners:            _reqSigs instanceof CborArray  ? _reqSigs.array.map( PubKeyHash.fromCborObj ) : undefined,
            network:                    _net instanceof CborUInt ? (Number( _net.num ) === 0 ? "testnet": "mainnet") : undefined,
            collateralReturn:           _collRet === undefined ? undefined : TxOut.fromCborObj( _collRet ),
            totCollateral:              _totColl instanceof CborUInt ? _totColl.num : undefined,
            refInputs:                  _refIns instanceof CborArray ? _refIns.array.map( txOutRefAsUTxOFromCborObj ) : undefined
        });
    }

    toJson()
    {
        return {
            inputs: this.inputs.map( i => i.toJson() ),
            outputs: this.outputs.map( o => o.toJson() ),
            fee: this.fee.toString(),
            ttl: this.ttl?.toString(),
            certs: this.certs?.map( c => c.toJson() ),
            withdrawals: this.withdrawals?.toJson() ,
            protocolUpdate: 
                this.protocolUpdate === undefined ? undefined :
                protocolUpdateToJson( this.protocolUpdate ),
            auxDataHash: this.auxDataHash?.asString , // hash 32
            validityIntervalStart: this.validityIntervalStart?.toString(),
            mint: this.mint?.toJson(),
            scriptDataHash: this.scriptDataHash?.asString, // hash 32
            collateralInputs: this.collateralInputs?.map( i => i.toJson() ), 
            requiredSigners: this.requiredSigners?.map( sig => sig.asString ),
            network: this.network,
            collateralReturn: this.collateralReturn?.toJson(),
            totCollateral: this.totCollateral?.toString(),
            refInputs: this.refInputs?.map( i => i.toJson() )
        }
    }

    /**
     * tests that
     * inputs + withdrawals + refund + mints === outputs + burns + deposit + fee
     * 
     * @todo add mints and burns
     * @deprecated until mints and burns are added
     */
    static isValueConserved( tx: TxBody ): boolean
    {
        const {
            inputs,
            withdrawals,
            outputs,
            certs,
            fee
        } = tx;

        // withdrawals
        let tot = withdrawals === undefined ? Value.zero : withdrawals.toTotalWitdrawn();

        // + inputs
        tot = inputs.reduce( (a,b) => Value.add( a, b.resolved.value ) , tot );
        
        // - (outputs + fee)
        // - outputs - fee
        tot = Value.sub(
            tot,
            outputs.reduce( (a,b) => Value.add( a, b.value ), Value.lovelaces( fee ) )
        );

        return Value.isZero(
            certs === undefined ?
            tot :
            Value.add(
                tot,
                Value.lovelaces( certificatesToDepositLovelaces( certs ) )
            )
        );
    }

};


function txOutRefAsUTxOFromCborObj( cObj: CborObj ): UTxO
{
    return new UTxO({
        utxoRef: TxOutRef.fromCborObj( cObj ),
        resolved: TxOut.fake
    });
}