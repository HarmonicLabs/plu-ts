# Offchain development timeline

total of 6 months

> **_NOTE:_** intended in case of proposal approvement, which will allow me to focus entirely on the project

- ensuring efficient CBOR interoperability 
  > 1 to 1 month and a half from the start of the project
  - JSON serializables object implementation
  - PlutusData implementation
- sending a simple Transaction, lovelaces only as value 
  > migth require from 2 up to 3 month from the finish of the previous step
  - building transaction object
    - implement transaction serialization to [CIP-0030 standard](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#apisigntxtx-cbortransaction-partialsign-bool--false-promisecbortransaction_witness_set) format
- sending multiasset transaction
  > depending from the previous step implementation, most of the code should be reusable, 1 month from the previous step in the worst case )
- Minting policies interacion
- SC interaction
  > Minting Policies and Smart contracts require a differen encodings the the one used up until now, expected 2 weeks, 1 month in the worst scenario
- Certificates management ( registration and deregistration )
  > at this point most of the code should be reusable the time remininig will be used for this step
