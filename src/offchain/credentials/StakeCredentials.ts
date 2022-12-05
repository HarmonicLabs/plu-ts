import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import Hash28 from "../hashes/Hash28/Hash28";
import Hash32 from "../hashes/Hash32/Hash32";

export class AddressStakeCredentials extends Hash28 {}

export class StakeValidatorHash extends Hash32 {}

export default class StakeCredentials
{
    readonly type!: "address" | "script";
    readonly hash!: AddressStakeCredentials | StakeCredentials

    constructor( hash: Hash28 | Hash32 )
    {
        JsRuntime.assert(
            hash instanceof Hash28 ||
            hash instanceof Hash32,
            "can't construct 'StakeCredentials'; hash must be instance of an 'Hash28' or 'Hash32'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "type",
            hash instanceof Hash28 ? "address" : "script"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "hash",
            hash instanceof Hash28 ? 
                ( hash instanceof AddressStakeCredentials ? hash : new AddressStakeCredentials( hash.asBytes ) ) :
                ( hash instanceof StakeValidatorHash ? hash : new StakeValidatorHash( hash.asBytes ) )
        );
    }
}