import { PaymentCredentials, PrivateKey } from "../../credentials";
import { Address, Value, defaultProtocolParameters } from "../../ledger";
import { UTxO } from "../body";
import { TxBuilder } from "../builder";

const txBuilder = new TxBuilder(
    "testnet",
    defaultProtocolParameters
);

const ffPrvtK = new PrivateKey("ff".repeat(32));
const ffPubK = ffPrvtK.derivePublicKey();
const ffPkh = ffPubK.hash;

const ffAddr = new Address(
    "testnet",
    new PaymentCredentials(
        "pubKey",
        ffPkh.clone()
    )
);

describe("tx.signWith", () => {
    
    test("no private keys", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                {
                    utxo: new UTxO({
                        utxoRef: {
                            id: "ff".repeat(32),
                            index: 0
                        },
                        resolved: {
                            address: ffAddr,
                            value: Value.lovelaces( 10_000_000 )
                        }
                    })
                }
            ],
            changeAddress: ffAddr
        });

        tx.signWith( ffPrvtK );

        expect(
            tx.witnesses.vkeyWitnesses
        ).not.toBe( undefined );

        expect(
            tx.witnesses.vkeyWitnesses?.length
        ).toBe( 1 );

    })
})