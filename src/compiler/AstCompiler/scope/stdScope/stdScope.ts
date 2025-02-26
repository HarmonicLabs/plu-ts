import { TirBoolT, TirBytesT, TirDataT, TirFuncT, TirLinearMapT, TirListT, TirIntT, TirOptT, TirSopT, TirVoidT, TirAsDataT } from "../../../tir/types/TirNativeType";
import { Scope } from "../Scope";
import { TirNativeType } from "../../../tir/types/TirNativeType";
import { PebbleConcreteTypeSym, PebbleGenericSym } from "../symbols/PebbleSym";
import { TirConcreteAliasType } from "../../../tir/types/TirConcreteAliasType";
import { TirConcreteStructConstr, TirConcreteStructField, TirConcreteStructType } from "../../../tir/types/TirConcreteStructType";
import { TirInterfaceImpl } from "../../../tir/types/TirInterfaceImpl";
import { TirInterfaceMethod, TirInterfaceType } from "../../../tir/types/TirInterfaceType";


/**
 * defines the {@link TirNativeType}s as 
 * {@link PebbleTypeSym}s in the standard scope
 */
export const stdScope = new Scope( undefined );

stdScope.defineType(
    new PebbleConcreteTypeSym({
        name: "void",
        concreteType: new TirVoidT()
    })
);
stdScope.defineType(
    new PebbleConcreteTypeSym({
        name: "boolean",
        concreteType: new TirBoolT()
    })
);
const int_t = new TirIntT();
stdScope.defineType(
    new PebbleConcreteTypeSym({
        name: "int",
        concreteType: int_t
    })
);
const bytes_t = new TirBytesT();
stdScope.defineType(
    new PebbleConcreteTypeSym({
        name: "bytes",
        concreteType: bytes_t
    })
);
const data_t = new TirDataT();
stdScope.defineType(
    new PebbleConcreteTypeSym({
        name: "data",
        concreteType: data_t
    })
);
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
stdScope.defineType(
    new PebbleGenericSym({
        name: "Sop",
        nTypeParameters: 1,
        getConcreteType(...typeArgs) {
            if( typeArgs.length < 1 )
                return undefined;
            const arg = typeArgs[0];
            if(!(
                arg instanceof TirConcreteStructType
                || (
                    arg instanceof TirConcreteAliasType
                    && arg.aliased instanceof TirConcreteStructType
                )
            )) return undefined;
            return new TirSopT(
                arg as TirConcreteStructType | TirConcreteAliasType<TirConcreteStructType>
            );
        },
    })
);
stdScope.defineType(
    new PebbleGenericSym({
        name: "AsData",
        nTypeParameters: 1,
        getConcreteType(...typeArgs) {
            if( typeArgs.length < 1 )
                return undefined;
            const arg = typeArgs[0];
            if(!(
                arg instanceof TirConcreteStructType
                || (
                    arg instanceof TirConcreteAliasType
                    && arg.aliased instanceof TirConcreteStructType
                )
            )) return undefined;
            return new TirAsDataT(
                arg as TirConcreteStructType | TirConcreteAliasType<TirConcreteStructType>
            );
        },
    })
);

stdScope.readonly();

export const preludeScope = new Scope( stdScope );

// export type Hash32 = bytes;
const hash32_t = new TirConcreteAliasType(
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
const hash28_t = new TirConcreteAliasType(
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
const policyId_t = new TirConcreteAliasType(
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
const tokenName_t = new TirConcreteAliasType(
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
const pubKeyHash_t = new TirConcreteAliasType(
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
const scriptHash_t = new TirConcreteAliasType(
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
const txHash_t = new TirConcreteAliasType(
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
    fields: { [x: string]: TirNativeType }
): TirConcreteStructType
{
    return new TirConcreteStructType(
        name,
        [
            new TirConcreteStructConstr(
                name,
                Object.keys( fields ).map( name => 
                    new TirConcreteStructField(name, fields[name])
                )
            )
        ],
        []
    );
}

function mkMultiConstructorStruct(
    name: string,
    constrs: { [x: string]: { [x: string]: TirNativeType } }
): TirConcreteStructType
{
    return new TirConcreteStructType(
        name,
        Object.keys( constrs ).map( constrName => 
            new TirConcreteStructConstr(
                constrName,
                Object.keys( constrs[constrName] ).map( name => 
                    new TirConcreteStructField(name, constrs[constrName][name])
                )
            )
        ),
        []
    );
}
// export struct TxOutRef {
//     id: TxHash,
//     index: int,
// }
const txOutRef_t = mkSingleConstructorStruct(
    "TxOutRef", {
        id: txHash_t,
        index: int_t
    }
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
const credential_t = mkMultiConstructorStruct(
    "Credential", {
        PubKey: {
            hash: pubKeyHash_t
        },
        Script: {
            hash: scriptHash_t
        }
    }
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
    })
);
// export type ChangedParameters = LinearMap<int,data>;
const map_int_data_sym = preludeScope.getAppliedGenericType(
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
const rational_t = mkSingleConstructorStruct(
    "Rational", {
        numerator: int_t,
        denominator: int_t
    }
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
const protocolVersion_t = mkSingleConstructorStruct(
    "ProtocolVersion", {
        major: int_t,
        minor: int_t
    }
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
const opt_scriptHash_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["ScriptHash"]
);
if(!opt_scriptHash_sym) throw new Error("expected opt_scriptHash_sym");
const constitutionInfo_t = mkSingleConstructorStruct(
    "ConstitutionInfo", {
        consitutionScriptHash: opt_scriptHash_sym.concreteType.clone()
    }
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
const opt_txOutRef_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["TxOutRef"]
);
if(!opt_txOutRef_sym) throw new Error("expected opt_txOutRef_sym");
const map_cred_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Credential", "int"]
);
if(!map_cred_int_sym) throw new Error("expected map_cred_int_sym");
const list_cred_sym = preludeScope.getAppliedGenericType(
    "List",
    ["Credential"]
);
if(!list_cred_sym) throw new Error("expected list_cred_sym");
const govAction_t = mkMultiConstructorStruct(
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
    }
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
const proposalProcedure_t = mkSingleConstructorStruct(
    "ProposalProcedure", {
        deposit: int_t,
        credential: credential_t.clone(),
        action: govAction_t.clone()
    }
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
const voter_t = mkMultiConstructorStruct(
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
    }
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
const scriptPurpose_t = mkMultiConstructorStruct(
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
    }
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
const opt_data_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["data"]
);
if(!opt_data_sym) throw new Error("expected opt_data_sym");
const scriptInfo_t = mkMultiConstructorStruct(
    "ScriptInfo", {
        Mint: {
            policy: policyId_t.clone()
        },
        Spend: {
            ref: txOutRef_t.clone(),
            datum: opt_data_sym.concreteType.clone()
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
    }
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
const stakeCredential_t = mkMultiConstructorStruct(
    "StakeCredential", {
        Credential: {
            credential: credential_t.clone()
        },
        Ptr: {
            a: int_t,
            b: int_t,
            c: int_t
        }
    }
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
const opt_stakeCredential_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["StakeCredential"]
);
if(!opt_stakeCredential_sym) throw new Error("expected opt_stakeCredential_sym");
const address_t = mkSingleConstructorStruct(
    "Address", {
        payment: credential_t.clone(),
        stake: opt_stakeCredential_sym.concreteType.clone()
    }
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Address",
        concreteType: address_t
    })
);
// export type Value = LinearMap<PolicyId, LinearMap<TokenName, int>>
const map_tokenName_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["TokenName", "int"]
);
if(!map_tokenName_int_sym) throw new Error("expected map_tokenName_int_sym");
const map_policyId_map_tokenName_int_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["PolicyId", map_tokenName_int_sym.name]
);
if(!map_policyId_map_tokenName_int_sym) throw new Error("expected map_policyId_map_tokenName_int_sym");
const value_t = new TirConcreteAliasType(
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
const outputDatum_t = mkMultiConstructorStruct(
    "OutputDatum", {
        NoDatum: {},
        DatumHash: {
            hash: hash32_t.clone()
        },
        InlineDatum: {
            datum: data_t.clone()
        }
    }
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
const txOut_t = mkSingleConstructorStruct(
    "TxOut", {
        address: address_t.clone(),
        value: value_t.clone(),
        datum: outputDatum_t.clone(),
        referenceScript: opt_scriptHash_sym.concreteType.clone()
    }
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
const txIn_t = mkSingleConstructorStruct(
    "TxIn", {
        txOutRef: txOutRef_t.clone(),
        resolved: txOut_t.clone()
    }
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
const extendedInteger_t = mkMultiConstructorStruct(
    "ExtendedInteger", {
        NegInf: {},
        Finite: {
            n: int_t.clone()
        },
        PosInf: {}
    }
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
const intervalBoundary_t = mkSingleConstructorStruct(
    "IntervalBoundary", {
        boundary: extendedInteger_t.clone(),
        isInclusive: new TirBoolT()
    }
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
const interval_t = mkSingleConstructorStruct(
    "Interval", {
        from: intervalBoundary_t.clone(),
        to: intervalBoundary_t.clone()
    }
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
const vote_t = mkMultiConstructorStruct(
    "Vote", {
        No: {},
        Yes: {},
        Abstain: {}
    }
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
const delegatee_t = mkMultiConstructorStruct(
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
    }
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
const opt_int_sym = preludeScope.getAppliedGenericType(
    "Optional",
    ["int"]
);
if(!opt_int_sym) throw new Error("expected opt_int_sym");
const certificate_t = mkMultiConstructorStruct(
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
    }
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
const list_txIn_sym = preludeScope.getAppliedGenericType(
    "List",
    ["TxIn"]
);
if(!list_txIn_sym) throw new Error("expected list_txIn_sym");
const list_txOut_sym = preludeScope.getAppliedGenericType(
    "List",
    ["TxOut"]
);
if(!list_txOut_sym) throw new Error("expected list_txOut_sym");
const list_certificate_sym = preludeScope.getAppliedGenericType(
    "List",
    ["Certificate"]
);
if(!list_certificate_sym) throw new Error("expected list_certificate_sym");
const list_pubKeyHash_sym = preludeScope.getAppliedGenericType(
    "List",
    ["PubKeyHash"]
);
if(!list_pubKeyHash_sym) throw new Error("expected list_pubKeyHash_sym");
const map_scriptPurpose_data_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["ScriptPurpose", "data"]
);
if(!map_scriptPurpose_data_sym) throw new Error("expected map_scriptPurpose_data_sym");
const map_hash32_data_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Hash32", "data"]
);
if(!map_hash32_data_sym) throw new Error("expected map_hash32_data_sym");
const map_txOutRef_vote_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["TxOutRef", "Vote"]
);
if(!map_txOutRef_vote_sym) throw new Error("expected map_txOutRef_vote_sym");
const map_voter_map_txOutRef_vote_sym = preludeScope.getAppliedGenericType(
    "LinearMap",
    ["Voter", map_txOutRef_vote_sym.name]
);
if(!map_voter_map_txOutRef_vote_sym) throw new Error("expected map_voter_map_txOutRef_vote_sym");
const list_proposalProcedure_sym = preludeScope.getAppliedGenericType(
    "List",
    ["ProposalProcedure"]
);
if(!list_proposalProcedure_sym) throw new Error("expected list_proposalProcedure_sym");
const tx_t = mkSingleConstructorStruct(
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
    }
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "Tx",
        concreteType: tx_t
    })
);
// export struct ScriptContext {
//     tx: Tx,
//     redeemer: data,
//     purpose: ScriptInfo
// }
const scriptContext_t = mkSingleConstructorStruct(
    "ScriptContext", {
        tx: tx_t.clone(),
        redeemer: data_t.clone(),
        purpose: scriptInfo_t.clone()
    }
);
preludeScope.defineType(
    new PebbleConcreteTypeSym({
        name: "ScriptContext",
        concreteType: scriptContext_t
    })
);
preludeScope.readonly();