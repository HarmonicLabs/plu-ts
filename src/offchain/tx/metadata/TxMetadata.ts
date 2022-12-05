import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import TxMetadatum, { isTxMetadatum } from "./TxMetadatum";

export type ITxMetadata = {
    [metadatum_label: number | string]: TxMetadatum 
}

type ITxMetadataStr = { [metadatum_label: string]: TxMetadatum };

export class TxMetadata
{
    readonly metadata!: ITxMetadataStr;

    constructor( metadata: ITxMetadata )
    {
        const _metadata = {};
        
        Object.keys( metadata )
        .forEach( k =>

            ObjectUtils.defineReadOnlyProperty(
                _metadata,
                BigInt( k ).toString(10),
                (() => {
                    const v = metadata[k];
                    JsRuntime.assert(
                        isTxMetadatum( v ),
                        "metatdatum with label " + k + " was not instace of 'TxMetadatum'"
                    );

                    return v;
                })()
            )

        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "metadata",
            _metadata
        );
    }
}