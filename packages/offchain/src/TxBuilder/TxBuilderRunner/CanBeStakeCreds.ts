import { StakeAddress, Credential, StakeAddressBech32, StakeCredentials, Script, PlutusScriptType, StakeValidatorHash, CredentialType, Hash28 } from "@harmoniclabs/cardano-ledger-ts";

export type CanBeStakeCreds
    = StakeAddress
    | StakeAddressBech32
    | StakeCredentials
    | Script<PlutusScriptType>
    | Credential;

export function forceStakeCreds( creds: CanBeStakeCreds ): Credential
{
    if( creds instanceof Credential ) return creds;

    if( typeof creds === "string" )
    {
        if( !creds.startsWith("stake") )
        {
            throw new Error("invalid bech32 stake address");
        }
        creds = StakeAddress.fromString( creds );
    }
    if( creds instanceof StakeAddress )
    {
        return creds.toCredential();
    }

    if( creds instanceof Script )
    {
        return Credential.script(
            new StakeValidatorHash( creds.hash )
        );
    }

    if( creds.type === "pointer" )
    {
        throw new Error("pointer stake credentials not supported");
    }

    return new Credential(
        creds.type === "script" ? CredentialType.Script : CredentialType.KeyHash,
        creds.hash as Hash28
    );
}