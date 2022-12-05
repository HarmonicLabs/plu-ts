import Hash32 from "../../hashes/Hash32/Hash32";
import Signature from "../../hashes/Signature/Signature";
import VKey from "./VKeyWitness/VKey";

export default class BootstrapWitness
{
    readonly pubKey: VKey;
    readonly signature!: Signature;
    readonly chainCode!: Hash32;
    readonly attributes!: Buffer;

    constructor( pubKey: Hash32, signature: Signature, chainCode: Hash32, attributes: Buffer )
    {

    }
}