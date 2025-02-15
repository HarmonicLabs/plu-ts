import { Source } from "../../ast/Source/Source";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { parseFile } from "../parseFile";

test.skip("parse TxOut", () => {
    const fileName = "TxOutRef.pebble";
    const srcText = `
export struct TxOutRef {
    id: bytes,
    index: int,
}
`;
    
    let src!: Source;
    let diagnosticMessages!: DiagnosticMessage[];
    expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();

    console.dir( src.statements, { depth: 2 } );
    console.dir( diagnosticMessages.map( msg => msg.toString() ) );

    expect( diagnosticMessages.length ).toBe( 0 );
});

test("parse std", () => {

    const fileName = "std.pebble";
    const srcText = `
export type Hash32 = bytes;
export type Hash28 = bytes;
export type PolicyId = Hash28;
export type TokenName = bytes;
export type PubKeyHash = Hash28;
export type ScriptHash = Hash28;
export type TxHash = Hash32;

export struct TxOutRef {
    id: TxHash,
    index: int,
}

export struct Credential {
    PubKey { hash: PubKeyHash }
    Script { hash: ScriptHash }
}

export type ChangedParameters = LinearMap<int,data>;

export struct Rational {
    numerator: int,
    denominator: int
}

export struct ProtocolVersion {
    major: int,
    minor: int
}

export struct ConstitutionInfo {
    consitutionScriptHash: Optional<ScriptHash>
}

export struct GovAction {
    ParameterChange {
        govActionId: Optional<TxOutRef>,
        changedParameters: ChangedParameters,
        constitutionScriptHash: Optional<ScriptHash>
    }
    HardForkInitiation {
        govActionId: Optional<TxOutRef>,
        nextProtocolVersion: ProtocolVersion
    }
    TreasuryWithdrawals {
        withdrawals: LinearMap<Credential, int>
        constitutionScriptHash: Optional<ScriptHash>
    }
    NoConfidence {
        govActionId: Optional<TxOutRef>
    }
    UpdateCommittee {
        govActionId: Optional<TxOutRef>,
        removed: List<Credential>,
        newMembers: LinearMap<Credential, int>,
        newQuorum: Rational
    }
    NewConstitution {
        govActionId: Optional<TxOutRef>,
        info: ConstitutionInfo
    }
    InfoAction {}
}

export struct ProposalProcedure {
    deposit: int,
    credential: Credential,
    action: GovAction
}

type Credential implements {
    hash(): bytes
    {
        // return case this
        //     is PubKey{ hash } => hash
        //     is Script{ hash } => hash;
        return builtin.unBData(
            builtin.unConstrData( this ).snd.head
        );
    }
}

export struct Voter {
    Committee {
        credential: Credential
    }
    DRep {
        credential: Credential
    }
    StakePool {
        pubKeyHash: PubKeyHash
    }
}

export struct ScriptPurpose {
    Mint { policy: PolicyId }
    Spend {
        ref: TxOutRef,
    }
    Withdraw {
        credential: Credential
    }
    Certificate {
        index: int,
        certificate: Certificate
    }
    Vote {
        voter: Voter
    }
    Propose {
        index: int,
        proposal: ProposalProcedure
    }
}

export struct ScriptInfo {
    Mint { policy: PolicyId }
    Spend {
        ref: TxOutRef,
        datum: Optional<data>
    }
    Withdraw {
        credential: Credential
    }
    Certificate {
        index: int,
        certificate: Certificate
    }
    Vote {
        voter: Voter
    }
    Propose {
        index: int,
        proposal: ProposalProcedure
    }
}

export struct StakeCredential {
    Credential { credential: Credential }
    Ptr {
        a: int,
        b: int,
        c: int
    }
}

export struct Address {
    payment: Credential,
    stake: Optional<Credential>
}

export type Value = LinearMap<PolicyId, LinearMap<TokenName, int>>

type Value implements {
    amountOf( policy: PolicyId, name: bytes ): int
    {
        // todo
        fail;
    }
}

export struct OutputDatum {
    NoDatum {}
    DatumHash { hash: Hash32 }
    InlineDatum { datum: data }
}

export struct TxOut {
    address: Address,
    value: Value,
    datum: OutputDatum,
    referenceScript: Optional<ScriptHash>
}

export struct TxIn {
    ref: TxOutRef,
    resolved: TxOut
}

export struct ExtendedInteger {
    NegInf {}
    Finite { n: int }
    PosInf {}
}

export struct IntervalBoundary {
    boundary: ExtendedInteger,
    isInclusive: boolean
}

export struct Interval {
    from: IntervalBoundary,
    to: IntervalBoundary,
}

export struct Vote {
    No {}
    Yes {}
    Abstain {}
}

export struct Tx {
    inputs: List<TxIn>,
    refInputs: List<TxIn>,
    outputs: List<TxOut>,
    fee: int,
    mint: Value,
    certificates: List<Certificate>,
    withdrawals: LinearMap<Credential, int>,
    validityInterval: Interval,
    requiredSigners: List<PubKeyHash>,
    redeemers: LinearMap<ScriptPurpose, data>,
    datums: LinearMap<Hash32, data>,
    hash: TxHash,
    votes: LinearMap<Voter, LinearMap<TxOutRef, Vote>>,
    proposals: List<ProposalProcedure>,
    currentTreasury: Optional<int>,
    treasuryDonation: Optional<int>
}

export struct ScriptContext {
    tx: Tx,
    redeemer: data,
    purpose: ScriptInfo
}
`;


    let src!: Source;
    let diagnosticMessages!: DiagnosticMessage[];
    expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();

    expect( diagnosticMessages.length ).toBe( 0 );
})