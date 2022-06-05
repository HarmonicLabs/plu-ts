# plu-ts/onchain

## the problem

- Haskell and GHC
## the solution

implement the Untyped Plutus Core specification in Typescript

## How ?

to see how this would be acheived have a look at the [proof-of-concept folder](../../../proof-of-concept)

However the high-leverl idea is to construct the AST (Abstract Syntax Tree) of an UPLC (Untyped Plutus Core) Program as an object using utility fiunctions, and at the moment of compilation

### Benefits of this approach

alongside everything specified in the [offchain readme](../off-chain/readme.md):
- testable code
- inline documentation
- useful debug features
- worst case scenario: reverse engineering via inspecting the code in a language that is familiar to the developer

there are benefits in contrast to the haskell implementation
- no template magic stuff ( even if possible thanks to some [meta-programming features of javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming) )
- GHC not messing around with names

In particoular, the creation of smart contracts in Typescript would allow for
- client-side parametrized smart contracts
- PABs (Plutus Application Backends) running on ```nodejs``` or ```deno```

### Challenges it comes with

- ```flat``` serialization
    at the moment of writing there is no flat serialization library for Typescript or Javascript,
    
    this is an issue since the ```haskell``` UPLC serialization implementation heavly depends on the library

    the reason for this is that the ```haskell``` equivalent laverages the builtin  haskell typeclass of ```Generics``` in order to have an idea of the datastructure to serialize

    there are 2 potential solutions to this
    - reimplementing ```flat``` from the bottom up
    - implementing a specialized subset of ```flat``` in order to be avble to work only with what is needed for the AST (Abstract Syntax Tree) of UPLC (Untyped Plutus Core) Programs

    for more informations follow the [timeline](./timeline.md) migth help to have an idea
    or follow either [my youtube channel](https://www.youtube.com/channel/UCirs7UT6W4cQFNb8FS4bNjw) or [my twitter](https://twitter.com/MicheleHarmonic) to stay updated
