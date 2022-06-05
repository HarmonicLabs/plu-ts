# plu-ts/offchain

## the problem

at the moment of writing few options are aviable for developers to write offchain code, all with important drawbacks:

- [plutus-pab](https://github.com/input-output-hk/plutus-apps/tree/main/plutus-pab) part of the [input-output-hk/plutus-apps](https://github.com/input-output-hk/plutus-apps) repository

    the PAB is great and allows to write offchain code in the same (and at the moment only) programming language of the actual on-chain code

    **BUT**

    the main drawback that here I explain in two words is too big to not be considered

    **IS**
    **CENTRALIZED**

    infact, as the name "Plutus Application Backend" suggests, this is a "Backend", therefore a **centralized server** building transactions with smartcontracts

    this means that if for whatever reason, the server, goes down (or worse is hacked) ther is no more Application (and no, it cannot be called dApp)

- [@emurgo/cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib)
    
    Written entirely in [rust](https://www.rust-lang.org/) is probably the library most used at the moment but also the most hated

    many other options often do have this library (or some derivative) as dependency, inheriting all the drawbacks of this one

    infact lacks severly of documentation and the [docs page reported by the library](https://docs.cardano.org/cardano-components/cardano-serialization-lib) basically just says "go get a PhD, understand abstract formulas with meaningless names for variables and then come back"

    it comes in various format:
    - node
    - browser/webassebly
    - browser/ASM.js

    all three offering poor help for debugging purposes,
    example:
    ```js
    console.log( someCardanoValue ) // <- ```Value``` is intended to be a set of tokens and ADA
    /*
    { ptr: 11190 } // wtf is this?
    */
    ```
- [cardano-transaction-lib](https://github.com/Plutonomicon/cardano-transaction-lib)

    among other libaries is worth noting the ```cardano-transaction-lib``` which seems to be doing a good job with limited potential to developers engagement, infact
    
    written in [purescript](https://www.purescript.org/) is less known than the above one and is thought for ```purescript``` developers, while this certainly allows client-side code creation, which is great, still will be usable by a small part of world-wide developers, in particular those who know ```purescript``` or ```haskell```

    while there are definitely some good aspects in this, still doesn't solve the ecosystem adoption problem

## the solution

re-implementing everything in Typescript

### Benefits of this approach

- testable code
    > often in order to use exsisting solutions with testing frameworks such as [jest](https://jestjs.io/) a mock version of the library is needed due to the incompatibility at vanilla ```js``` level

- inline documentation
    > even if everything will be documented separately it is easy to add inline documentation for everything in VSCode
    > ![documentation on hover example](../../assets/docs_on_hover.gif)

- useful debug features
    if evertingh is ```ts/js``` coded, even in cases of classes with private fields doing something like
    ```js
    console.log( someCardanoValue ) // <- ```Value``` is intended to be a set of tokens and ADA
    ```
    would then output something like
    ```js
    Value {
        _private_valueObj : {...}
        toJsonSerializable: f ()
        // ... etc
    }
    ```
    defenitely more useful and easy to use,
    infact from the prevoius output any courious enugh developer will then test
    ```js
    console.log( someCardanoValue.toJsonSerializable() );
    ```
    and get the more useful
    ```js
    [
        "": { // ADA policy
            "": 1_000_000_000 // ADA tokenName : 1000 ADA
        },
        "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235": { // HOSKY policy hash
            "484F534B59" : 1 // HOSKY in hex: 1 HOSKY = 1M HOSKY = 0$
        }
    ]
    ```

- worst case scenario: reverse engineering via inspecting the code in a language that is familiar to the developer
