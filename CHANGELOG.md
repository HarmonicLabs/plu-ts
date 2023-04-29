# Changelog

## [NEXT] v0.4.0

- CIP57 (Plutus blueprints) support
- modular design
- changed value interface (`IValue`)
    - assets field must be an **array** of `{ name: Uint8Array, quantity: number | bigint }` (previously was an object)

## v0.3.0

- introudced the `IR`
- deprecated `plet( pexpr ).in( pvar => ... )` in favor of `const pvar = plet( pexpr )`
- deprecated `struct.extract( ...fields ).in( structInstance => ... )` in favor of plain dot notation ( eg. `structInstance.field` )

## v0.2.1 - v0.2.3

- introduced the `src/offchain` folder exporting
    - all the Ledger types
    - the `TxBuilder` class

## v0.1.10

- fixed some `plu-ts` level types bugs

## v0.1.9

- fixes some bugs in UPLC code generation
    - `getFromDataForType` returns `punMapData` for `list( pair( any, any ) )` terms
- introduces `dynPair` type (interchangeable to `pair` type for what matters about typings)
## v0.1.5

- introduced `pdynPair` for dynamic `Term<PPair<...>>` creation, to overcome the lack of a `mkPair` builtin;
    - adjusted `pfstPair` and `psndPair` accordingly
    - adjusted `getFromDataForType` macro and `getFromDataTermForType` accordingly
- fixed bug in `papp` (previously using `b` instead of `_b`)
- fixed some ts types

## v0.1.4

- `papp` (and `$` method) accepts ts values and converts it automatically when possible
    > _example_: if `Term<PInt>` is expected it should be possible to pass `1` without having to do `pInt(1)`
    - simple constants (`int`, `bs`, `bool`, etc... )
    - functions (`lam`, `fn`)
    - structured types (`list`, `pair`)
    - modified exsisting utility terms methods accordingly
- added `TermPair`
- added `pPair` for constants pairs

## v0.1.3

- `evalScript` optimizations
    - definition of `CEKHeap` to store `CEKValues` in no particular order
    - modify `CEKEnv` to point at values in the `CEKHeap` rather than having a local copy (and copying them when cloning too)
- `Data` classes are now cloning the fields in the constructor and the fields getters now will return freezed object (`Data` is meant to be immutable anyway)


## v0.1.2

- `pand` and `por` take a `delayed( bool )` as second argument (before was just strict `bool`)
    - change definitons
    - add `strictAnd` and `strictOr` versions
- `pfoldr` and `pfoldl` (`reduce` method of js arrays) for `TermList`
    - `pfoldr` and `pfoldl`
    - re-implementation of exsisting functions (`pfilter`,`pmap`, etc...) in terms of `pfold[rl]` (should result in smaller scripts if used multiple times)
- `UtilityTermOf<PLam<...>>` returns `TermFn<...>`
- `UtilityTermOf<PAlias<SomePType>>` returns `Term<PAlias<...>> & UtilityTermOf<SomePType>`
- `ToPType<AliasTermType<...>>` now returns `PAlias<...>`
- fixed some `TermList` typescript types

## v0.1.1

- UtilityTerms should expose typescript functions rather than plu-ts ones; this was done to incentivize developers to reuse the terms but it extremly hurts readability
- UtilityTerms will still expose the plu-ts term equivalent of each method trough the `<method name>Term` property