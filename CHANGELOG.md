# Changelog

## Unreleased v0.1.4

- [ ] `papp` (and `$` method) tries to accept ts values and convert it automatically when possible
    > _example_
    > 
    > if `Term<PInt>` is expected it should be possible to pass `1` without having to do `pInt(1)`
    - [ ] simple constants (`int`, `bs`, `bool`, etc... )
    - [ ] functions (`lam`, `fn`)

## Unreleased v0.1.3

- [ ] `evalScript` optimizations
    - [ ] definition of `CEKHeap` to store `CEKValues` in no particular order
    - [ ] modify `CEKEnv` to point at values in the `CEKHeap` rather than having a local copy (and copying them when cloning too)

## Unreleased v0.1.2

- [ ] `pfoldr` and `pfoldl` (`preduce`) for `TermList`
    - [x] `pfoldr` and `pfoldl`
    - [ ] re-implementation of exsisting functions (`pfilter`,`pmap`,`pevery`,`psome`, etc...) in terms of `pfold[rl]` (should result in smaller scripts)
- [x] `UtilityTermOf<PLam<...>>` returns `TermFn<...>`
- [x] `UtilityTermOf<PAlias<SomePType>>` returns `Term<PAlias<...>> & UtilityTermOf<SomePType>`
- [x] `ToPType<AliasTermType<...>>` now returns `PAlias<...>`
- [x] fixed some `TermList` typescript types

## v0.1.1

- UtilityTerms should expose typescript functions rather than plu-ts ones; this was done to incentivize developers to reuse the terms but it extremly hurts readability
- UtilityTerms will still expose the plu-ts term equivalent of each method trough the `<method name>Term` property