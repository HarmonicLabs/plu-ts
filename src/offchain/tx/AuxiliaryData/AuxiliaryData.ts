import { PlutusScriptVersion, ScriptJsonFormat } from "../../../onchain/pluts/Script";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import NativeScript from "../../script/NativeScript";
import Script, { ScriptType } from "../../script/Script";
import { TxMetadata } from "../metadata/TxMetadata";

export interface IAuxiliaryData {
    metadata: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V1> | Script<ScriptType.PlutusV1>)[];
    plutusV2Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V2> | Script<ScriptType.PlutusV2>)[];
}

export default class AuxiliaryData
    implements IAuxiliaryData
{
    readonly metadata!: TxMetadata;
    readonly nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    readonly plutusV1Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V1> | Script<ScriptType.PlutusV1>)[];
    readonly plutusV2Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V2> | Script<ScriptType.PlutusV2>)[];

    constructor( auxData: IAuxiliaryData )
    {
        JsRuntime.assert(
            ObjectUtils.hasOwn( auxData, "metadata" ),
            "'AuxiliaryData' is missing 'metadata' field"
        );

        const {
            metadata,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts
        } = auxData;

        JsRuntime.assert(
            metadata instanceof TxMetadata,
            "'AuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "metadata",
            metadata
        );

        // -------------------------------- native scripts -------------------------------- //
        if( nativeScripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( nativeScripts ) &&
                nativeScripts.every( script => {

                    return true;
                }),
                "invalid nativeScripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "nativeScripts",
                nativeScripts.length === 0 ? undefined : Object.freeze( nativeScripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "nativeScripts",
                undefined
            );
        }

        // -------------------------------- plutus v1 -------------------------------- //
        if( plutusV1Scripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( plutusV1Scripts ) &&
                plutusV1Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV1Scripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                plutusV1Scripts.length === 0 ? undefined : Object.freeze( plutusV1Scripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                undefined
            );
        }

        // -------------------------------- plutus v2 -------------------------------- //
        if( plutusV2Scripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( plutusV2Scripts ) &&
                plutusV2Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV2Scripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                plutusV2Scripts.length === 0 ? undefined : Object.freeze( plutusV2Scripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                undefined
            );
        }


    }
}