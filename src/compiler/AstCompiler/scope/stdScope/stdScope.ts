import { TirBoolT, TirBytesT, TirDataT, TirFuncT, TirLinearMapT, TirListT, TirIntT, TirOptT, TirVoidT, TirStringT } from "../../../tir/types/TirNativeType";
import { Scope } from "../Scope";
import { TirNativeType } from "../../../tir/types/TirNativeType";
import { PebbleConcreteTypeSym, PebbleGenericSym } from "../symbols/PebbleSym";
import { TirAliasType } from "../../../tir/types/TirAliasType";
import { StructFlags, TirStructConstr, TirStructField, TirStructType } from "../../../tir/types/TirStructType";
import { TirTypeParam } from "../../../tir/types/TirTypeParam";


/**
 * defines the {@link TirNativeType}s as 
 * {@link PebbleTypeSym}s in the standard scope
 */
export const stdScope = new Scope( undefined, { isFunctionDeclScope: false } );

export const void_t = new TirVoidT();
export const void_sym = new PebbleConcreteTypeSym({
    name: "void",
    concreteType: void_t,
});
stdScope.defineType( void_sym );

export const bool_t = new TirBoolT();
export const bool_sym = new PebbleConcreteTypeSym({
    name: "boolean",
    concreteType: bool_t,
});
stdScope.defineType( bool_sym );

export const int_t = new TirIntT();
export const int_sym = new PebbleConcreteTypeSym({
    name: "int",
    concreteType: int_t,
});
stdScope.defineType( int_sym );

export const bytes_t = new TirBytesT();
export const bytes_sym = new PebbleConcreteTypeSym({
    name: "bytes",
    concreteType: bytes_t
});
stdScope.defineType( bytes_sym );

export const string_t = new TirStringT();
export const string_sym = new PebbleConcreteTypeSym({
    name: "string",
    concreteType: string_t
});
stdScope.defineType( string_sym );

export const data_t = new TirDataT();
export const data_sym = new PebbleConcreteTypeSym({
    name: "data",
    concreteType: data_t
});
stdScope.defineType( data_sym );
export const any_optional_t = new TirOptT( new TirTypeParam("T") );
stdScope.defineType(
    new PebbleGenericSym({
        name: "Optional",
        nTypeParameters: 1,
        getConcreteType( ...typeArgs ) {
            if( typeArgs.length < 1 )
                return undefined;
            return new TirOptT(typeArgs[0]);
        },
    })
);
export const any_list_t = new TirListT( new TirTypeParam("T") );
stdScope.defineType(
    new PebbleGenericSym({
        name: "List",
        nTypeParameters: 1,
        getConcreteType(...typeArgs) {
            if( typeArgs.length < 1 )
                return undefined;
            return new TirListT(typeArgs[0]);
        },
    })
);
export const any_linearMap_t = new TirLinearMapT( new TirTypeParam("KeyT"), new TirTypeParam("ValueT") );
stdScope.defineType(
    new PebbleGenericSym({
        name: "LinearMap",
        nTypeParameters: 2,
        getConcreteType(...typeArgs) {
            if( typeArgs.length < 2 )
                throw new Error("expected 2 type arguments");
            return new TirLinearMapT(typeArgs[0], typeArgs[1]);
        },
    })
);

stdScope.readonly();

export const preludeScope = new Scope( stdScope, { isFunctionDeclScope: false } );

// export type Hash32 = bytes;
export const hash32_t = new TirAliasType(
    "Hash32",
    bytes_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Hash32",
        concreteType: hash32_t
    })
);
// export type Hash28 = bytes;
export const hash28_t = new TirAliasType(
    "Hash28",
    bytes_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Hash28",
        concreteType: hash28_t
    })
);
// export type PolicyId = Hash28;
export const policyId_t = new TirAliasType(
    "PolicyId",
    hash28_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "PolicyId",
        concreteType: policyId_t
    })
);
// export type TokenName = bytes;
export const tokenName_t = new TirAliasType(
    "TokenName",
    bytes_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "TokenName",
        concreteType: tokenName_t
    })
);
// export type PubKeyHash = Hash28;
export const pubKeyHash_t = new TirAliasType(
    "PubKeyHash",
    hash28_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "PubKeyHash",
        concreteType: pubKeyHash_t
    })
);
// export type ScriptHash = Hash28;
export const scriptHash_t = new TirAliasType(
    "ScriptHash",
    hash28_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ScriptHash",
        concreteType: scriptHash_t
    })
);
// export type TxHash = Hash32;
export const txHash_t = new TirAliasType(
    "TxHash",
    hash32_t,
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "TxHash",
        concreteType: txHash_t
    })
);

function mkSingleConstructorStruct(
    name: string,
    fields: { [x: string]: TirNativeType },
    flags: StructFlags
): TirStructType
{
    return new TirStructType(
        name,
        [
            new TirStructConstr(
                name,
                Object.keys( fields ).map( name => 
                    new TirStructField(name, fields[name])
                )
            )
        ],
        [],
        flags
    );
}

function mkMultiConstructorStruct(
    name: string,
    constrs: { [x: string]: { [x: string]: TirNativeType } },
    flags: StructFlags
): TirStructType
{
    return new TirStructType(
        name,
        Object.keys( constrs ).map( constrName => 
            new TirStructConstr(
                constrName,
                Object.keys( constrs[constrName] ).map( name => 
                    new TirStructField(name, constrs[constrName][name])
                )
            )
        ),
        [],
        flags
    );
}
// export struct TxOutRef {
//     id: TxHash,
//     index: int,
// }
export const txOutRef_t = mkSingleConstructorStruct(
    "TxOutRef", {
        id: txHash_t,
        index: int_t
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "TxOutRef",
        concreteType: txOutRef_t
    })
);
// export struct Credential {
//     PubKey { hash: PubKeyHash }
//     Script { hash: ScriptHash }
// }
export const credential_t = mkMultiConstructorStruct(
    "Credential", {
        PubKey: {
            hash: pubKeyHash_t
        },
        Script: {
            hash: scriptHash_t
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
// TODO: 
// understand how to describe function impls
// const credential_t_impl = new TirInterfaceType(
//     undefined,
//     [],
//     []
// )
// credential_t_impl.methods.push(
//     new TirInterfaceMethod(
//         credential_t_impl,
//         "hash",
//         [],
//         hash28_t
//     )
// );
// credential_t.impls.push(
//     new TirInterfaceImpl(
//         credential_t,
//         credential_t_impl
//     )
// );
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Credential",
        concreteType: credential_t
    }),
);
// export type ChangedParameters = LinearMap<int,data>;
export const map_int_data_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["int", "data"]
);
if(!map_int_data_sym) throw new Error("expected changedParametersSym");
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ChangedParameters",
        concreteType: map_int_data_sym.concreteType.clone()
    })
);
// export struct Rational {
//     numerator: int,
//     denominator: int
// }
export const rational_t = mkSingleConstructorStruct(
    "Rational", {
        numerator: int_t,
        denominator: int_t
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Rational",
        concreteType: rational_t
    })
);
// export struct ProtocolVersion {
//     major: int,
//     minor: int
// }
export const protocolVersion_t = mkSingleConstructorStruct(
    "ProtocolVersion", {
        major: int_t,
        minor: int_t
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ProtocolVersion",
        concreteType: protocolVersion_t
    })
);
// export struct ConstitutionInfo {
//     consitutionScriptHash: Optional<ScriptHash>
// }
export const opt_scriptHash_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["ScriptHash"]
);
if(!opt_scriptHash_sym) throw new Error("expected opt_scriptHash_sym");
export const constitutionInfo_t = mkSingleConstructorStruct(
    "ConstitutionInfo", {
        consitutionScriptHash: opt_scriptHash_sym.concreteType.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ConstitutionInfo",
        concreteType: constitutionInfo_t
    })
);
// export struct GovAction {
//     ParameterChange {
//         govActionId: Optional<TxOutRef>,
//         changedParameters: ChangedParameters,
//         constitutionScriptHash: Optional<ScriptHash>
//     }
//     HardForkInitiation {
//         govActionId: Optional<TxOutRef>,
//         nextProtocolVersion: ProtocolVersion
//     }
//     TreasuryWithdrawals {
//         withdrawals: LinearMap<Credential, int>
//         constitutionScriptHash: Optional<ScriptHash>
//     }
//     NoConfidence {
//         govActionId: Optional<TxOutRef>
//     }
//     UpdateCommittee {
//         govActionId: Optional<TxOutRef>,
//         removed: List<Credential>,
//         newMembers: LinearMap<Credential, int>,
//         newQuorum: Rational
//     }
//     NewConstitution {
//         govActionId: Optional<TxOutRef>,
//         info: ConstitutionInfo
//     }
//     InfoAction {}
// }
export const opt_txOutRef_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["TxOutRef"]
);
if(!opt_txOutRef_sym) throw new Error("expected opt_txOutRef_sym");
export const map_cred_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Credential", "int"]
);
if(!map_cred_int_sym) throw new Error("expected map_cred_int_sym");
export const list_cred_sym = preludeScope.getAppliedGenericType(
    "List",
    ["Credential"]
);
if(!list_cred_sym) throw new Error("expected list_cred_sym");
export const govAction_t = mkMultiConstructorStruct(
    "GovAction", {
        ParameterChange: {
            govActionId: opt_txOutRef_sym.concreteType.clone(),
            changedParameters: map_int_data_sym.concreteType.clone(),
            constitutionScriptHash: opt_scriptHash_sym.concreteType.clone()
        },
        HardForkInitiation: {
            govActionId: opt_txOutRef_sym.concreteType.clone(),
            nextProtocolVersion: protocolVersion_t.clone()
        },
        TreasuryWithdrawals: {
            withdrawals: map_cred_int_sym.concreteType.clone(),
            constitutionScriptHash: opt_scriptHash_sym.concreteType.clone()
        },
        NoConfidence: {
            govActionId: opt_txOutRef_sym.concreteType.clone()
        },
        UpdateCommittee: {
            govActionId: opt_txOutRef_sym.concreteType.clone(),
            removed: list_cred_sym.concreteType.clone(),
            newMembers: map_cred_int_sym.concreteType.clone(),
            newQuorum: rational_t.clone()
        },
        NewConstitution: {
            govActionId: opt_txOutRef_sym.concreteType.clone(),
            info: constitutionInfo_t.clone()
        },
        InfoAction: {}
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "GovAction",
        concreteType: govAction_t
    })
);
// export struct ProposalProcedure {
//     deposit: int,
//     credential: Credential,
//     action: GovAction
// }
export const proposalProcedure_t = mkSingleConstructorStruct(
    "ProposalProcedure", {
        deposit: int_t,
        credential: credential_t.clone(),
        action: govAction_t.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ProposalProcedure",
        concreteType: proposalProcedure_t
    })
);
// export struct Voter {
//     Committee {
//         credential: Credential
//     }
//     DRep {
//         credential: Credential
//     }
//     StakePool {
//         credential: PubKeyHash
//     }
// }
export const voter_t = mkMultiConstructorStruct(
    "Voter", {
        Committee: {
            credential: credential_t.clone()
        },
        DRep: {
            credential: credential_t.clone()
        },
        StakePool: {
            pubKeyHash: pubKeyHash_t.clone()
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Voter",
        concreteType: voter_t
    })
);
// export struct ScriptPurpose {
//     Mint { policy: PolicyId }
//     Spend {
//         ref: TxOutRef,
//     }
//     Withdraw {
//         credential: Credential
//     }
//     Certificate {
//         index: int,
//         certificate: Certificate
//     }
//     Vote {
//         voter: Voter
//     }
//     Propose {
//         index: int,
//         proposal: ProposalProcedure
//     }
// }
export const scriptPurpose_t = mkMultiConstructorStruct(
    "ScriptPurpose", {
        Mint: {
            policy: policyId_t.clone()
        },
        Spend: {
            ref: txOutRef_t.clone()
        },
        Withdraw: {
            credential: credential_t.clone()
        },
        Certificate: {
            index: int_t,
            certificate: credential_t.clone()
        },
        Vote: {
            voter: voter_t.clone()
        },
        Propose: {
            index: int_t,
            proposal: proposalProcedure_t.clone()
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ScriptPurpose",
        concreteType: scriptPurpose_t
    })
);
// export struct ScriptInfo {
//     Mint { policy: PolicyId }
//     Spend {
//         ref: TxOutRef,
//         datum: Optional<data>
//     }
//     Withdraw {
//         credential: Credential
//     }
//     Certificate {
//         index: int,
//         certificate: Certificate
//     }
//     Vote {
//         voter: Voter
//     }
//     Propose {
//         index: int,
//         proposal: ProposalProcedure
//     }
// }
export const opt_data_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["data"]
);
if(!opt_data_sym) throw new Error("expected opt_data_sym");
export const scriptInfo_t = mkMultiConstructorStruct(
    "ScriptInfo", {
        Mint: {
            policy: policyId_t.clone()
        },
        Spend: {
            ref: txOutRef_t.clone(),
            optionalDatum: opt_data_sym.concreteType.clone()
        },
        Withdraw: {
            credential: credential_t.clone()
        },
        Certificate: {
            index: int_t,
            certificate: credential_t.clone()
        },
        Vote: {
            voter: voter_t.clone()
        },
        Propose: {
            index: int_t,
            proposal: proposalProcedure_t.clone()
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ScriptInfo",
        concreteType: scriptInfo_t
    })
);
// export struct StakeCredential {
//     Credential { credential: Credential }
//     Ptr {
//        a: int,
//        b: int,
//        c: int
//     }
// }
export const stakeCredential_t = mkMultiConstructorStruct(
    "StakeCredential", {
        Credential: {
            credential: credential_t.clone()
        },
        Ptr: {
            a: int_t,
            b: int_t,
            c: int_t
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "StakeCredential",
        concreteType: stakeCredential_t
    })
);
// export struct Address {
//     payment: Credential,
//     stake: Optional<Credential>
// }
export const opt_stakeCredential_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["StakeCredential"]
);
if(!opt_stakeCredential_sym) throw new Error("expected opt_stakeCredential_sym");
export const address_t = mkSingleConstructorStruct(
    "Address", {
        payment: credential_t.clone(),
        stake: opt_stakeCredential_sym.concreteType.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Address",
        concreteType: address_t
    })
);
// export type Value = LinearMap<PolicyId, LinearMap<TokenName, int>>
export const map_tokenName_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["TokenName", "int"]
);
if(!map_tokenName_int_sym) throw new Error("expected map_tokenName_int_sym");
export const map_policyId_map_tokenName_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["PolicyId", map_tokenName_int_sym.name]
);
if(!map_policyId_map_tokenName_int_sym) throw new Error("expected map_policyId_map_tokenName_int_sym");
export const value_t = new TirAliasType(
    "Value",
    map_policyId_map_tokenName_int_sym.concreteType.clone(),
    []
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Value",
        concreteType: value_t
    })
);

/* // TODO
type Value implements {
    amountOf( policy: PolicyId, name: bytes ): int
    {
        // todo
        fail;
    }
    lovelaces(): int
    {
        return this.amountOf( #, # );
    }
}
*/

// export struct OutputDatum {
//     NoDatum {}
//     DatumHash { hash: Hash32 }
//     InlineDatum { datum: data }
// }
export const outputDatum_t = mkMultiConstructorStruct(
    "OutputDatum", {
        NoDatum: {},
        DatumHash: {
            hash: hash32_t.clone()
        },
        InlineDatum: {
            datum: data_t.clone()
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "OutputDatum",
        concreteType: outputDatum_t
    })
);
// export struct TxOut {
//     address: Address,
//     value: Value,
//     datum: OutputDatum,
//     referenceScript: Optional<ScriptHash>
// }
export const txOut_t = mkSingleConstructorStruct(
    "TxOut", {
        address: address_t.clone(),
        value: value_t.clone(),
        datum: outputDatum_t.clone(),
        referenceScript: opt_scriptHash_sym.concreteType.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "TxOut",
        concreteType: txOut_t
    })
);
// export struct TxIn {
//     txOutRef: TxOutRef,
//     resolved: TxOut
// }
export const txIn_t = mkSingleConstructorStruct(
    "TxIn", {
        txOutRef: txOutRef_t.clone(),
        resolved: txOut_t.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "TxIn",
        concreteType: txIn_t
    })
);
// export struct ExtendedInteger {
//     NegInf {}
//     Finite { n: int }
//     PosInf {}
// }
export const extendedInteger_t = mkMultiConstructorStruct(
    "ExtendedInteger", {
        NegInf: {},
        Finite: {
            n: int_t.clone()
        },
        PosInf: {}
    }, StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ExtendedInteger",
        concreteType: extendedInteger_t
    })
);
// export struct IntervalBoundary {
//     boundary: ExtendedInteger,
//     isInclusive: boolean
// }
export const intervalBoundary_t = mkSingleConstructorStruct(
    "IntervalBoundary", {
        boundary: extendedInteger_t.clone(),
        isInclusive: bool_t.clone()
    }, StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "IntervalBoundary",
        concreteType: intervalBoundary_t
    })
);
// export struct Interval {
//     from: IntervalBoundary,
//     to: IntervalBoundary,
// }
export const interval_t = mkSingleConstructorStruct(
    "Interval", {
        from: intervalBoundary_t.clone(),
        to: intervalBoundary_t.clone()
    }, StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Interval",
        concreteType: interval_t
    })
);
// export struct Vote {
//     No {}
//     Yes {}
//     Abstain {}
// }
export const vote_t = mkMultiConstructorStruct(
    "Vote", {
        No: {},
        Yes: {},
        Abstain: {}
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Vote",
        concreteType: vote_t
    })
);
// export struct Delegatee {
//     StakePool { poolKeyHash: PubKeyHash }
//     DRep { drep: Credential }
//     PoolAndDRep {
//         poolKeyHash: PubKeyHash,
//         drep: Credential
//     }
// }
export const delegatee_t = mkMultiConstructorStruct(
    "Delegatee", {
        StakePool: {
            poolKeyHash: pubKeyHash_t.clone()
        },
        DRep: {
            drep: credential_t.clone()
        },
        PoolAndDRep: {
            poolKeyHash: pubKeyHash_t.clone(),
            drep: credential_t.clone()
        }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Delegatee",
        concreteType: delegatee_t
    })
);
// export struct Certificate {
//     StakeRegistration {
//         stakeKey: Credential,
//         deposit: Optional<int>
//     }
//     StakeDeRegistration {
//         stakeKey: Credential,
//         refund: Optional<int>
//     }
//     Delegation {
//         delegator: Credential,
//         delegatee: Delegatee
//     }
//     RegistrationAndDelegation {
//         delegator: Credential,
//         delegatee: Delegatee,
//         lovelacesDeposit: int
//     }
//     DRepRegistration {
//         drep: Credential,
//         lovelacesDeposit: int
//     }
//     DRepUpdate {
//         drep: Credential
//     }
//     DRepDeRegistration {
//         drep: Credential,
//         refund: int
//     }
//     PoolRegistration {
//         poolId: PubKeyHash,
//         poolVRF: PubKeyHash
//     }
//     PoolRetire {
//         poolId: PubKeyHash,
//         epoch: int
//     }
//     CommitteeHotAuthorization {
//         cold: Credential,
//         hot: Credential
//     }
//     CommitteeResignation {
//         cold: Credential
//     }
// }
export const opt_int_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["int"]
);
if(!opt_int_sym) throw new Error("expected opt_int_sym");
export const certificate_t = mkMultiConstructorStruct(
    "Certificate", {
        StakeRegistration: {
            stakeKey: credential_t.clone(),
            deposit: opt_int_sym.concreteType.clone()
        },
        StakeDeRegistration: {
            stakeKey: credential_t.clone(),
            refund: opt_int_sym.concreteType.clone()
        },
        Delegation: {
            delegator: credential_t.clone(),
            delegatee: delegatee_t.clone()
        },
        RegistrationAndDelegation: {
            delegator: credential_t.clone(),
            delegatee: delegatee_t.clone(),
            lovelacesDeposit: int_t.clone()
        },
        DRepRegistration: {
            drep: credential_t.clone(),
            lovelacesDeposit: int_t.clone()
        },
        DRepUpdate: {
            drep: credential_t.clone()
        },
        DRepDeRegistration: {
            drep: credential_t.clone(),
            refund: int_t.clone()
        },
        PoolRegistration: {
            poolId: pubKeyHash_t.clone(),
            poolVRF: bytes_t.clone()
        },
        PoolRetire: {
            poolId: pubKeyHash_t.clone(),
            epoch: int_t.clone()
        },
        CommitteeHotAuthorization: {
            cold: credential_t.clone(),
            hot: credential_t.clone()
        },
        CommitteeResignation: { cold: credential_t.clone() }
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Certificate",
        concreteType: certificate_t
    })
);
// export struct Tx {
//     inputs: List<TxIn>,
//     refInputs: List<TxIn>,
//     outputs: List<TxOut>,
//     fee: int,
//     mint: Value,
//     certificates: List<Certificate>,
//     withdrawals: LinearMap<Credential, int>,
//     validityInterval: Interval,
//     requiredSigners: List<PubKeyHash>,
//     redeemers: LinearMap<ScriptPurpose, data>,
//     datums: LinearMap<Hash32, data>,
//     hash: TxHash,
//     votes: LinearMap<Voter, LinearMap<TxOutRef, Vote>>,
//     proposals: List<ProposalProcedure>,
//     currentTreasury: Optional<int>,
//     treasuryDonation: Optional<int>
// }
export const list_txIn_sym = preludeScope.getAppliedGenericType(
    "List",
    ["TxIn"]
);
if(!list_txIn_sym) throw new Error("expected list_txIn_sym");
export const list_txOut_sym = preludeScope.getAppliedGenericType(
    "List",
    ["TxOut"]
);
if(!list_txOut_sym) throw new Error("expected list_txOut_sym");
export const list_certificate_sym = preludeScope.getAppliedGenericType(
    "List",
    ["Certificate"]
);
if(!list_certificate_sym) throw new Error("expected list_certificate_sym");
export const list_pubKeyHash_sym = preludeScope.getAppliedGenericType(
    "List",
    ["PubKeyHash"]
);
if(!list_pubKeyHash_sym) throw new Error("expected list_pubKeyHash_sym");
export const map_scriptPurpose_data_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["ScriptPurpose", "data"]
);
if(!map_scriptPurpose_data_sym) throw new Error("expected map_scriptPurpose_data_sym");
export const map_hash32_data_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Hash32", "data"]
);
if(!map_hash32_data_sym) throw new Error("expected map_hash32_data_sym");
export const map_txOutRef_vote_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["TxOutRef", "Vote"]
);
if(!map_txOutRef_vote_sym) throw new Error("expected map_txOutRef_vote_sym");
export const map_voter_map_txOutRef_vote_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Voter", map_txOutRef_vote_sym.name]
);
if(!map_voter_map_txOutRef_vote_sym) throw new Error("expected map_voter_map_txOutRef_vote_sym");
export const list_proposalProcedure_sym = preludeScope.getAppliedGenericType(
    "List",
    ["ProposalProcedure"]
);
if(!list_proposalProcedure_sym) throw new Error("expected list_proposalProcedure_sym");
export const tx_t = mkSingleConstructorStruct(
    "Tx", {
        inputs: list_txIn_sym.concreteType.clone(),
        refInputs: list_txIn_sym.concreteType.clone(),
        outputs: list_txOut_sym.concreteType.clone(),
        fee: int_t.clone(),
        mint: value_t.clone(),
        certificates: list_certificate_sym.concreteType.clone(),
        withdrawals: map_cred_int_sym.concreteType.clone(),
        validityInterval: interval_t.clone(),
        requiredSigners: list_pubKeyHash_sym.concreteType.clone(),
        redeemers: map_scriptPurpose_data_sym.concreteType.clone(),
        datums: map_hash32_data_sym.concreteType.clone(),
        hash: txHash_t.clone(),
        votes: map_voter_map_txOutRef_vote_sym.concreteType.clone(),
        proposals: list_proposalProcedure_sym.concreteType.clone(),
        currentTreasury: opt_int_sym.concreteType.clone(),
        treasuryDonation: opt_int_sym.concreteType.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Tx",
        concreteType: tx_t
    })
);
// export tagged data struct ScriptContext {
//     tx: Tx,
//     redeemer: data,
//     purpose: ScriptInfo
// }
export const scriptContext_t = mkSingleConstructorStruct(
    "ScriptContext", {
        tx: tx_t.clone(),
        redeemer: data_t.clone(),
        purpose: scriptInfo_t.clone()
    }, StructFlags.onlyData | StructFlags.taggedDataEncoding
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ScriptContext",
        concreteType: scriptContext_t
    })
);
preludeScope.readonly();