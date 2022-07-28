<p align="center">
  <img width="100px" src="./assets/logo/plu-ts.svg" align="center"/>
  <h1 align="center">plu-ts</h1>
  <p align="center">plu-ts is a library, which wants to allow Cardano smart contract creation and protocol interaction only using Typescript</p>

  <p align="center">
    <img src="https://img.shields.io/github/commit-activity/m/harmonicpool/plu-ts?style=for-the-badge" />
    <a href="https://twitter.com/MicheleHarmonic">
      <img src="https://img.shields.io/twitter/follow/MicheleHarmonic?style=for-the-badge&logo=twitter" />
    </a>
  </p>

</p>

## why plu-ts?
---

there is the need for decentralized applications, however the tools to build a [**truly** decentralized](https://en.wikipedia.org/wiki/Decentralization) application are missing or limited to static compilation.


## what is plu-ts?
---

```plu-ts``` wants to be a library to allow Cardano-related software to be written entirely in [typescript](https://www.typescriptlang.org/), allowing a for a wider developer ecosystem adoption and easier integration.

the project will be composed mainly of two parts: on-chain and off-chain;

the on-chain part will take care of smart contracts creation
the off-chain one will allow for transaction creation (so will take care of smart contracts interaction, among all the off-chain stuff)

to know more about the high-level ideas see the ```docs/specification-notes``` folder:
  - [off-chain](./docs/specification-notes/off-chain)
  - [on-chain](./docs/specification-notes/on-chain)

## Get Started
---

the project is at its early stages; follow [@MicheleHarmonic on twitter](https://twitter.com/MicheleHarmonic) to stay updated on major milestones.

## Contribute
---

If you wan't to take part in the history of Cardano then checkout the [contributing guidelines](./CONTRIBUTING.md) and check out the [developer documentation](./dev-docs)

## Project Catalyst
---

there are a few proposals related to the development of this repository in the current found:
- [Typescript smart-contracts](https://cardano.ideascale.com/c/idea/414103)
- [100% Typescript offchain code](https://cardano.ideascale.com/c/idea/414144)

a collection of all proposals made can be found in the [```catalyst-proposals.md```](./catalyst-proposals.md) file