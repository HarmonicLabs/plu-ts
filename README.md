# plu-ts
Write Cardano-related, on-chain and off-chain code, entirely in Typescript 

## why plu-ts?

there is the need for decentralized applications, however the tools to built a [**truly** decentralized](https://en.wikipedia.org/wiki/Decentralization) application are missing or limited to static compilation

```plu-ts``` wants to be a library to allow Cardano-related software to be written entirely in [typescript](https://www.typescriptlang.org/), allowing a wider developer ecosystem to code both:
 - applications backands running on [nodejs](https://nodejs.dev/) or [deno](https://deno.land/)
 - dApps with smart-contracts created _on-the-fly_, **client-side**

to know more see the folder ```docs/why-plu-ts```
  - [off-chain/readme.md](./docs//why-plu-ts/off-chain/readme.md)
  - [on-chain/readme.md](./docs//why-plu-ts/on-chain/readme.md)

there are a few proposals to speed up the development of this repository:
- [Typescript smart-contracts]() link will be updated as soon the proposal is written
- [100% Typescript offchain code]() link will be updated as soon the proposal is written

old proposals:

- Found 8:
  - [(passed, not founded) F8 proposal for an Offchain Typescript library](https://cardano.ideascale.com/c/idea/396949)

## possible timeline

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
