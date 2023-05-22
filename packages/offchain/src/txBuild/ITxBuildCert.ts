import { AnyCertificate, Certificate, Script, UTxO } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, forceData } from "../utils/CanBeData"
import { hasOwn } from "@harmoniclabs/obj-utils"
import { isData, cloneData } from "@harmoniclabs/plutus-data"

export interface ITxBuildCert {
    cert: AnyCertificate
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: UTxO
        redeemer: CanBeData
    }
};

export function cloneITxBuildCert( cert: ITxBuildCert ): ITxBuildCert
{
    const script = cert.script === undefined ? undefined: hasOwn( cert.script, "inline" ) ?
    {
        inline: cert.script.inline.clone(),
        redeemer: isData( cert.script.redeemer ) ? cloneData( cert.script.redeemer ) : forceData( cert.script.redeemer )
    } :
    {
        ref: cert.script.ref.clone(),
        redeemer: isData( cert.script.redeemer ) ? cloneData( cert.script.redeemer ) : forceData( cert.script.redeemer )
    };
    
    return {
        cert: Certificate.fromCborObj( cert.cert.toCborObj() ),
        script
    };
}