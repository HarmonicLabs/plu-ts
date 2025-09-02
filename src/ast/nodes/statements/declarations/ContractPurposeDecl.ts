import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { SourceRange } from "../../../Source/SourceRange";
import { BlockStmt } from "../BlockStmt";
import { SimpleVarDecl } from "./VarDecl/SimpleVarDecl";

export enum ContractPurposeKind {
    Spend = "spend",
    Mint = "mint",
    Certify = "certify",
    Withdraw = "withdraw",
    Propose = "propose",
    Vote = "vote"
}

export class ContractPurposeDecl implements HasSourceRange
{
    readonly kind: ContractPurposeKind;
    readonly name: Identifier;
    readonly parameters: SimpleVarDecl[];
    readonly body: BlockStmt;
    readonly range: SourceRange;

    constructor(
        kind: ContractPurposeKind,
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    )
    {
        this.kind = kind;
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.range = range;
    }
}

export class SpendDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Spend, name, parameters, body, range);
    }
}

export class MintDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Mint, name, parameters, body, range);
    }
}

export class CertifyDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Certify, name, parameters, body, range);
    }
}

export class WithdrawDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Withdraw, name, parameters, body, range);
    }
}

export class ProposeDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Propose, name, parameters, body, range);
    }
}

export class VoteDecl extends ContractPurposeDecl {
    constructor(
        name: Identifier,
        parameters: SimpleVarDecl[],
        body: BlockStmt,
        range: SourceRange
    ) {
        super(ContractPurposeKind.Vote, name, parameters, body, range);
    }
}
