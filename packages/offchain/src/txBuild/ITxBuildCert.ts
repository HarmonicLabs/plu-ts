import { Certificate, CertificateLike, ICert, IUTxO, Script, UTxO, certificateFromCborObj, certificateFromCertificateLike, isIUTxO } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, canBeData, forceData } from "../utils/CanBeData"
import { hasOwn, isObject } from "@harmoniclabs/obj-utils"
import { isData, cloneData, Data } from "@harmoniclabs/plutus-data"

export interface ITxBuildCert {
    cert: CertificateLike
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: IUTxO
        redeemer: CanBeData
    }
};

export interface NormalizedITxBuildCert extends ITxBuildCert {
    cert: Certificate
    script?: {
        inline: Script
        redeemer: Data
    } | {
        ref: UTxO
        redeemer: Data
    }
};

export function normalizeITxBuildCert({ cert, script }: ITxBuildCert ): NormalizedITxBuildCert
{
    if(
        !isObject( script ) || 
        !canBeData( (script as any).redeemer )
    )
    {
        script = undefined;
    }
    else if( isIUTxO( (script as any).ref ) )
    {
        script = {
            ref: new UTxO( (script as any).ref ),
            redeemer: forceData( (script as any).redeemer )
        };
    } else {
        script = {
            inline: ((script as any).inline as Script).clone(),
            redeemer: forceData( (script as any).redeemer )
        };
    }

    return {
        cert: certificateFromCertificateLike( cert ),
        script
    } as NormalizedITxBuildCert;
}

/** @deprecated use `normalizeITxBuildCert` instead */
export function cloneITxBuildCert( cert: ITxBuildCert ): ITxBuildCert
{
    return normalizeITxBuildCert( cert );
}